import { notFound } from "next/navigation";
import { Badge, Box, Card, Group, Stack, Text, Title } from "@mantine/core";
import { prisma } from "@/lib/prisma";
import { Icon } from "@/components/ui-icons";
import { styleConfigSchema } from "@/lib/qr-style";
import { contentConfigToFieldState, type QrTypeValue } from "@/lib/qr-content";
import { EditForm } from "./edit-form";

export default async function EditQrPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const qr = await prisma.qrCode.findUnique({ where: { id } });
  if (!qr) notFound();

  const templates = await prisma.brandTemplate.findMany({
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });

  const style = styleConfigSchema.parse(qr.styleConfig);
  const fields = contentConfigToFieldState(qr.type as QrTypeValue, qr.contentConfig);
  const redirectBase = process.env.NEXT_PUBLIC_REDIRECT_BASE_URL ?? "";

  return (
    <Stack gap="lg">
      <Card p="lg">
        <Group justify="space-between" align="flex-start" gap="md">
          <Box>
            <Text size="xs" fw={800} tt="uppercase" c="dimmed" lts="0.08em">
              Edit QR
            </Text>
            <Title order={1} size="h2" mt={4}>
              {qr.label}
            </Title>
            <Text c="dimmed" mt="xs" maw={760}>
              Tracking link {redirectBase}/q/{qr.slug} is what new exports will encode. Legacy printed links still resolve through the old shortcode.
            </Text>
          </Box>
          <Badge color="blue" variant="light" leftSection={<Icon name="link" className="h-3.5 w-3.5" />}>
            {qr.slug}
          </Badge>
        </Group>
      </Card>
      <EditForm
        qr={{
            id: qr.id,
            type: qr.type as QrTypeValue,
            label: qr.label,
            slug: qr.slug,
            tags: qr.tags.join(", "),
            shortcode: qr.shortcode,
          brandTemplateId: qr.brandTemplateId,
          fields,
          style,
        }}
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
