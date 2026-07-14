import {
  ActionIcon,
  Badge,
  Box,
  Card,
  Grid,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { prisma } from "@/lib/prisma";
import { deleteBrandTemplate } from "./actions";
import { TemplateForm } from "./template-form";
import { QrPreview } from "@/components/qr-preview";
import { Icon } from "@/components/ui-icons";

export default async function TemplatesPage() {
  const templates = await prisma.brandTemplate.findMany({
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });

  return (
    <Stack gap="lg">
      <Card p="lg">
        <Group justify="space-between" align="flex-start" gap="md">
          <Box>
            <Text size="xs" fw={800} tt="uppercase" c="dimmed" lts="0.08em">
              Brand system
            </Text>
            <Title order={1} size="h2" mt={4}>
              Brand templates
            </Title>
            <Text c="dimmed" mt="xs" maw={760}>
              Reusable QR presets for PCI colors, dot styles, and logo placement.
            </Text>
          </Box>
          <Badge color="blue" variant="light" leftSection={<Icon name="palette" className="h-3.5 w-3.5" />}>
            {templates.length} templates
          </Badge>
        </Group>
      </Card>

      <Grid gap="lg" align="flex-start">
        <Grid.Col span={{ base: 12, xl: 8 }}>
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
            {templates.map((template) => (
              <Card key={template.id} p="md">
                <Group align="flex-start" gap="md" wrap="nowrap">
                  <Box className="qr-thumb-large">
                    <QrPreview
                      size={72}
                      data="https://pcirealestate.com"
                      style={{
                        foreground: template.foreground,
                        background: template.background,
                        dotStyle: (template.dotStyle as never) ?? "square",
                        cornerStyle: (template.cornerStyle as never) ?? "square",
                        logoUrl: template.logoUrl,
                        margin: 8,
                      }}
                    />
                  </Box>
                  <Box miw={0} flex={1}>
                    <Group gap="xs" wrap="nowrap">
                      <Text fw={700} truncate>
                        {template.name}
                      </Text>
                      {template.isDefault ? <Badge color="blue" variant="light">Default</Badge> : null}
                    </Group>
                    <Text size="sm" c="dimmed" mt={4}>
                      {template.dotStyle}/{template.cornerStyle}
                    </Text>
                    <Group gap="xs" mt="sm">
                      <Box className="color-dot" style={{ backgroundColor: template.foreground }} />
                      <Box className="color-dot" style={{ backgroundColor: template.background }} />
                      {template.logoUrl ? (
                        <Badge color="gray" variant="light" leftSection={<Icon name="image" className="h-3 w-3" />}>
                          Logo
                        </Badge>
                      ) : null}
                    </Group>
                  </Box>
                </Group>
                <Group justify="space-between" mt="md" pt="md" className="top-border">
                  <Text ff="monospace" size="xs" c="dimmed">
                    {template.foreground} / {template.background}
                  </Text>
                  <form action={deleteBrandTemplate.bind(null, template.id)}>
                    <ActionIcon type="submit" variant="subtle" color="red" aria-label={`Delete ${template.name}`}>
                      <Icon name="trash" className="h-4 w-4" />
                    </ActionIcon>
                  </form>
                </Group>
              </Card>
            ))}
            {templates.length === 0 ? (
              <Paper withBorder p="xl" radius="lg" ta="center">
                <ThemeIcon size="xl" radius="xl" variant="light" color="blue" mx="auto" mb="md">
                  <Icon name="palette" className="h-5 w-5" />
                </ThemeIcon>
                <Title order={3} size="h4">
                  No brand templates yet
                </Title>
                <Text c="dimmed" mt="xs">
                  Create one to make PCI styling available in the QR builder.
                </Text>
              </Paper>
            ) : null}
          </SimpleGrid>
        </Grid.Col>

        <Grid.Col span={{ base: 12, xl: 4 }}>
          <Box className="sticky-panel">
            <Group gap="xs" mb="md">
              <ThemeIcon variant="light" color="blue" radius="md">
                <Icon name="plus" className="h-4 w-4" />
              </ThemeIcon>
              <Box>
                <Title order={2} size="h4">
                  New template
                </Title>
                <Text size="sm" c="dimmed">
                  Save a reusable brand preset.
                </Text>
              </Box>
            </Group>
            <TemplateForm />
          </Box>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
