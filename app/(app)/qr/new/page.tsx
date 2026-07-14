import { prisma } from "@/lib/prisma";
import { Badge, Box, Card, Group, Stack, Text, Title } from "@mantine/core";
import { Icon } from "@/components/ui-icons";
import { CreatorForm } from "./creator-form";

export default async function NewQrPage() {
  const templates = await prisma.brandTemplate.findMany({
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });

  return (
    <Stack gap="lg">
      <Card p="lg">
        <Group justify="space-between" align="flex-start" gap="md">
          <Box>
            <Text size="xs" fw={800} tt="uppercase" c="dimmed" lts="0.08em">
              Create QR
            </Text>
            <Title order={1} size="h2" mt={4}>
              Build a branded dynamic code
            </Title>
            <Text c="dimmed" mt="xs" maw={720}>
              Every QR encodes a short PCI tracking link, so printed material can stay fixed while the destination changes later.
            </Text>
          </Box>
          <Badge color="blue" variant="light" leftSection={<Icon name="shield" className="h-3.5 w-3.5" />}>
            Dynamic by default
          </Badge>
        </Group>
      </Card>
      <CreatorForm
        templates={templates.map((t) => ({
          id: t.id,
          name: t.name,
          foreground: t.foreground,
          background: t.background,
          dotStyle: t.dotStyle,
          cornerStyle: t.cornerStyle,
          logoUrl: t.logoUrl,
          isDefault: t.isDefault,
        }))}
      />
    </Stack>
  );
}
