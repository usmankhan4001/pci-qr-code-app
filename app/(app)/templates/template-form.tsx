"use client";

import { useActionState, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  ColorInput,
  FileInput,
  Group,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { createBrandTemplate, type TemplateFormState } from "./actions";
import { QrPreview } from "@/components/qr-preview";
import { Icon } from "@/components/ui-icons";
import { dotStyleValues, cornerStyleValues, type StyleConfig } from "@/lib/qr-style";

const initialState: TemplateFormState = {};

export function TemplateForm() {
  const [state, formAction, pending] = useActionState(createBrandTemplate, initialState);
  const [foreground, setForeground] = useState("#0B2545");
  const [background, setBackground] = useState("#FFFFFF");
  const [dotStyle, setDotStyle] = useState<StyleConfig["dotStyle"]>("rounded");
  const [cornerStyle, setCornerStyle] = useState<StyleConfig["cornerStyle"]>("extra-rounded");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleLogoChange(file: File | null) {
    if (!file) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.set("file", file);
      const res = await fetch("/api/uploads/logo", { method: "POST", body });
      const json = await res.json();
      if (res.ok) {
        setLogoUrl(json.url);
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card p="lg">
      <form action={formAction}>
        <input type="hidden" name="logoUrl" value={logoUrl ?? ""} />
        <Stack gap="md">
          <TextInput label="Name" name="name" required placeholder="PCI Standard" leftSection={<Icon name="tag" className="h-4 w-4" />} />

          <Card withBorder p="md" bg="gray.0">
            <Group gap="xs" mb="md">
              <ThemeIcon variant="light" color="blue" radius="md">
                <Icon name="palette" className="h-4 w-4" />
              </ThemeIcon>
              <Title order={3} size="h5">
                Color system
              </Title>
            </Group>
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <ColorInput
                label="Foreground"
                name="foreground"
                value={foreground}
                onChange={setForeground}
                format="hex"
                swatches={["#0B2545", "#123A63", "#1F4F85", "#000000", "#4F9A4D"]}
              />
              <ColorInput
                label="Background"
                name="background"
                value={background}
                onChange={setBackground}
                format="hex"
                swatches={["#FFFFFF", "#F8FAFC", "#F6F8FB", "#FBF6EA"]}
              />
            </SimpleGrid>
          </Card>

          <Card withBorder p="md" bg="gray.0">
            <Group gap="xs" mb="md">
              <ThemeIcon variant="light" color="blue" radius="md">
                <Icon name="layers" className="h-4 w-4" />
              </ThemeIcon>
              <Title order={3} size="h5">
                Shape language
              </Title>
            </Group>
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <Select
                label="Dot style"
                name="dotStyle"
                value={dotStyle}
                onChange={(value) => setDotStyle((value ?? "rounded") as StyleConfig["dotStyle"])}
                data={dotStyleValues.map((value) => ({ value, label: value }))}
              />
              <Select
                label="Corner style"
                name="cornerStyle"
                value={cornerStyle}
                onChange={(value) => setCornerStyle((value ?? "extra-rounded") as StyleConfig["cornerStyle"])}
                data={cornerStyleValues.map((value) => ({ value, label: value }))}
              />
            </SimpleGrid>
          </Card>

          <FileInput
            label="Logo"
            description="Optional. PNG, JPG, SVG, or WebP."
            accept="image/png,image/jpeg,image/svg+xml,image/webp"
            onChange={handleLogoChange}
            leftSection={<Icon name="image" className="h-4 w-4" />}
            clearable
          />
          {uploading ? <Text size="xs" c="dimmed">Uploading...</Text> : null}

          <Checkbox name="isDefault" label="Make this the default template" />

          {state.error ? <Alert color="red">{state.error}</Alert> : null}
          {state.success ? <Alert color="green">Template saved.</Alert> : null}

          <Button type="submit" loading={pending || uploading} leftSection={<Icon name="sparkle" className="h-4 w-4" />}>
            Save template
          </Button>
        </Stack>
      </form>

      <Card withBorder bg="gray.0" mt="lg" p="md">
        <Stack align="center" gap="sm">
          <Text size="sm" fw={700} c="dimmed">
            Preview
          </Text>
          <QrPreview data="https://pcirealestate.com" style={{ foreground, background, dotStyle, cornerStyle, logoUrl, margin: 8 }} />
        </Stack>
      </Card>
    </Card>
  );
}
