"use client";

import { useActionState, useState } from "react";
import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Code,
  ColorInput,
  Divider,
  Grid,
  Group,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { updateQrCode, type EditQrState } from "./actions";
import { QrPreview } from "@/components/qr-preview";
import { Icon, type IconName } from "@/components/ui-icons";
import { ContentFields } from "@/components/qr-content-fields";
import { qrTypeValues, type QrTypeValue } from "@/lib/qr-content";
import { dotStyleValues, cornerStyleValues, type StyleConfig } from "@/lib/qr-style";
import { slugify } from "@/lib/slug";

type TemplateOption = {
  id: string;
  name: string;
  foreground: string;
  background: string;
  dotStyle: string | null;
  cornerStyle: string | null;
  logoUrl: string | null;
  isDefault: boolean;
};

type QrData = {
  id: string;
  type: QrTypeValue;
  label: string;
  slug: string;
  tags: string;
  shortcode: string;
  brandTemplateId: string | null;
  fields: Record<string, string>;
  style: StyleConfig;
};

const initialState: EditQrState = {};

const typeLabels: Record<QrTypeValue, string> = {
  URL: "Website / URL",
  VCARD: "Contact card",
  WIFI: "Wi-Fi network",
  TEXT: "Plain text",
  EMAIL: "Email",
  PHONE: "Phone number",
};

const typeMeta: Record<QrTypeValue, { icon: IconName; description: string }> = {
  URL: { icon: "globe", description: "Listings, landing pages, portals" },
  VCARD: { icon: "shield", description: "Agent contact cards" },
  WIFI: { icon: "wifi", description: "Office or event access" },
  TEXT: { icon: "type", description: "Plain notes or instructions" },
  EMAIL: { icon: "mail", description: "Pre-filled enquiries" },
  PHONE: { icon: "phone", description: "Tap-to-call campaigns" },
};

export function EditForm({ qr, templates }: { qr: QrData; templates: TemplateOption[] }) {
  const [state, formAction, pending] = useActionState(updateQrCode, initialState);
  const [type, setType] = useState<QrTypeValue>(qr.type);
  const [slug, setSlug] = useState(qr.slug);
  const [fields, setFields] = useState<Record<string, string>>(qr.fields);
  const [templateId, setTemplateId] = useState(qr.brandTemplateId ?? "");
  const [style, setStyle] = useState<StyleConfig>(qr.style);

  const redirectBase = process.env.NEXT_PUBLIC_REDIRECT_BASE_URL ?? "";
  const previewSlug = slugify(slug);
  const previewData = `${redirectBase}/q/${previewSlug}`;
  const currentTemplateName = templates.find((template) => template.id === templateId)?.name ?? "Custom";

  function setField(name: string, value: string) {
    setFields((prev) => ({ ...prev, [name]: value }));
  }

  function applyTemplate(id: string | null) {
    const nextId = id ?? "";
    setTemplateId(nextId);
    const template = templates.find((tpl) => tpl.id === nextId);
    if (!template) return;
    setStyle({
      foreground: template.foreground,
      background: template.background,
      dotStyle: (template.dotStyle as StyleConfig["dotStyle"]) ?? "square",
      cornerStyle: (template.cornerStyle as StyleConfig["cornerStyle"]) ?? "square",
      logoUrl: template.logoUrl,
      margin: 8,
    });
  }

  return (
    <Grid gap="lg" align="flex-start">
      <Grid.Col span={{ base: 12, xl: 8 }}>
        <form action={formAction}>
          <input type="hidden" name="id" value={qr.id} />
          <input type="hidden" name="brandTemplateId" value={templateId} />
          <input type="hidden" name="type" value={type} />
          <input type="hidden" name="foreground" value={style.foreground} />
          <input type="hidden" name="background" value={style.background} />
          <input type="hidden" name="dotStyle" value={style.dotStyle} />
          <input type="hidden" name="cornerStyle" value={style.cornerStyle} />
          <input type="hidden" name="logoUrl" value={style.logoUrl ?? ""} />
          <input type="hidden" name="margin" value={style.margin} />

          <Stack gap="lg">
            <Card p="lg">
              <Group justify="space-between" align="flex-start" mb="md">
                <Box>
                  <Group gap="xs" mb={4}>
                    <ThemeIcon variant="light" color="blue" radius="md">
                      <Icon name="qr" className="h-4 w-4" />
                    </ThemeIcon>
                    <Title order={3} size="h4">
                      QR type
                    </Title>
                  </Group>
                  <Text size="sm" c="dimmed">
                    Change only if this printed code should behave differently.
                  </Text>
                </Box>
                <Badge variant="light" color="gray">
                  Edit
                </Badge>
              </Group>

              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="sm">
                {qrTypeValues.map((item) => {
                  const selected = type === item;
                  return (
                    <UnstyledButton
                      key={item}
                      className="type-card"
                      data-active={selected || undefined}
                      onClick={() => {
                        setType(item);
                        setFields({});
                      }}
                    >
                      <Group gap="sm" align="flex-start" wrap="nowrap">
                        <ThemeIcon variant={selected ? "filled" : "light"} color="blue" radius="md" size="lg">
                          <Icon name={typeMeta[item].icon} className="h-4 w-4" />
                        </ThemeIcon>
                        <Box>
                          <Text fw={700} size="sm">
                            {typeLabels[item]}
                          </Text>
                          <Text size="xs" c="dimmed" mt={2}>
                            {typeMeta[item].description}
                          </Text>
                        </Box>
                      </Group>
                    </UnstyledButton>
                  );
                })}
              </SimpleGrid>
            </Card>

            <Card p="lg">
              <Group justify="space-between" align="flex-start" mb="md">
                <Box>
                  <Group gap="xs" mb={4}>
                    <ThemeIcon variant="light" color="blue" radius="md">
                      <Icon name="fileText" className="h-4 w-4" />
                    </ThemeIcon>
                    <Title order={3} size="h4">
                      Campaign details
                    </Title>
                  </Group>
                  <Text size="sm" c="dimmed">
                    New exports encode the readable slug. Old printed shortcodes keep resolving.
                  </Text>
                </Box>
              </Group>

              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                <TextInput label="Label" name="label" required defaultValue={qr.label} />
                <TextInput
                  label="Tracking slug"
                  name="slug"
                  required
                  value={slug}
                  onChange={(event) => setSlug(slugify(event.currentTarget.value))}
                  description={`New exports encode /q/${previewSlug}. Legacy: /q/${qr.shortcode}`}
                  classNames={{ input: "mono-input" }}
                />
                <TextInput label="Tags" name="tags" defaultValue={qr.tags} />
                <ContentFields type={type} fields={fields} setField={setField} />
              </SimpleGrid>
            </Card>

            <Card p="lg">
              <Group justify="space-between" align="flex-start" mb="md">
                <Box>
                  <Group gap="xs" mb={4}>
                    <ThemeIcon variant="light" color="blue" radius="md">
                      <Icon name="palette" className="h-4 w-4" />
                    </ThemeIcon>
                    <Title order={3} size="h4">
                      Brand styling
                    </Title>
                  </Group>
                  <Text size="sm" c="dimmed">
                    Fine tune the saved QR appearance without adding visual noise.
                  </Text>
                </Box>
              </Group>

              <Stack gap="md">
                {templates.length > 0 ? (
                  <Select
                    label="Brand template"
                    value={templateId}
                    onChange={applyTemplate}
                    data={[{ value: "", label: "Custom (no template)" }, ...templates.map((template) => ({ value: template.id, label: template.name }))]}
                  />
                ) : null}
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                  <ColorInput
                    label="Foreground"
                    value={style.foreground}
                    onChange={(value) => setStyle((current) => ({ ...current, foreground: value }))}
                    format="hex"
                    swatches={["#0B2545", "#123A63", "#1F4F85", "#000000", "#4F9A4D"]}
                  />
                  <ColorInput
                    label="Background"
                    value={style.background}
                    onChange={(value) => setStyle((current) => ({ ...current, background: value }))}
                    format="hex"
                    swatches={["#FFFFFF", "#F8FAFC", "#F6F8FB", "#FBF6EA"]}
                  />
                  <Select
                    label="Dot style"
                    value={style.dotStyle}
                    onChange={(value) => setStyle((current) => ({ ...current, dotStyle: (value ?? "square") as StyleConfig["dotStyle"] }))}
                    data={dotStyleValues.map((value) => ({ value, label: value }))}
                  />
                  <Select
                    label="Corner style"
                    value={style.cornerStyle}
                    onChange={(value) => setStyle((current) => ({ ...current, cornerStyle: (value ?? "square") as StyleConfig["cornerStyle"] }))}
                    data={cornerStyleValues.map((value) => ({ value, label: value }))}
                  />
                </SimpleGrid>
              </Stack>
            </Card>

            {state.error ? (
              <Alert color="red" icon={<Icon name="shield" className="h-4 w-4" />}>
                {state.error}
              </Alert>
            ) : null}

            <Paper withBorder p="md" radius="lg">
              <Group justify="space-between" gap="md">
                <Text size="sm" c="dimmed">
                  Saving slug <Code>{previewSlug}</Code> for new exports.
                </Text>
                <Button type="submit" loading={pending} leftSection={<Icon name="edit" className="h-4 w-4" />}>
                  Save changes
                </Button>
              </Group>
            </Paper>
          </Stack>
        </form>
      </Grid.Col>

      <Grid.Col span={{ base: 12, xl: 4 }}>
        <Card p="lg" className="sticky-panel">
          <Group justify="space-between" mb="md">
            <Box>
              <Title order={3} size="h4">
                Live proof
              </Title>
              <Text size="sm" c="dimmed">
                Legacy shortcode remains available for existing prints.
              </Text>
            </Box>
            <Badge color="green" variant="light">
              Active edit
            </Badge>
          </Group>
          <Box className="qr-stage">
            <QrPreview data={previewData} style={style} size={220} />
          </Box>
          <Code block mt="md" className="break-code">
            {previewData}
          </Code>
          <Divider my="md" />
          <Stack gap="xs">
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Type
              </Text>
              <Text size="sm" fw={700}>
                {typeLabels[type]}
              </Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Template
              </Text>
              <Text size="sm" fw={700} truncate maw={180}>
                {currentTemplateName}
              </Text>
            </Group>
          </Stack>
        </Card>
      </Grid.Col>
    </Grid>
  );
}
