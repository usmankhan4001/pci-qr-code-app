import Link from "next/link";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Code,
  Group,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";
import { QrPreview } from "@/components/qr-preview";
import { Icon, type IconName } from "@/components/ui-icons";
import { styleConfigSchema } from "@/lib/qr-style";
import { qrTypeValues } from "@/lib/qr-content";
import { cloneQrCode, setQrStatus, deleteQrCode } from "./actions";

type SearchParams = {
  q?: string;
  type?: string;
  tag?: string;
  status?: string;
};

export default async function DashboardPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const status = params.status ?? "ACTIVE";

  const where: Prisma.QrCodeWhereInput = {};
  if (status !== "ALL") {
    where.status = status as "ACTIVE" | "ARCHIVED";
  }
  if (params.type && qrTypeValues.includes(params.type as never)) {
    where.type = params.type as (typeof qrTypeValues)[number];
  }
  if (params.tag) {
    where.tags = { has: params.tag };
  }
  if (params.q) {
    where.OR = [
      { label: { contains: params.q, mode: "insensitive" } },
      { slug: { contains: params.q, mode: "insensitive" } },
      { shortcode: { contains: params.q, mode: "insensitive" } },
    ];
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [qrCodes, totalCodes, activeCodes, archivedCodes, scansLast30] = await Promise.all([
    prisma.qrCode.findMany({ where, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.qrCode.count(),
    prisma.qrCode.count({ where: { status: "ACTIVE" } }),
    prisma.qrCode.count({ where: { status: "ARCHIVED" } }),
    prisma.scan.count({ where: { scannedAt: { gte: thirtyDaysAgo } } }),
  ]);

  const redirectBase = process.env.NEXT_PUBLIC_REDIRECT_BASE_URL ?? "";

  return (
    <Stack gap="lg">
      <Card p="lg">
        <Group justify="space-between" align="flex-start" gap="md">
          <Box>
            <Text size="xs" fw={800} tt="uppercase" c="dimmed" lts="0.08em">
              QR library
            </Text>
            <Title order={1} size="h2" mt={4}>
              Dynamic QR codes
            </Title>
            <Text c="dimmed" mt="xs" maw={760}>
              Manage live QR assets, update destinations after print, and export readable tracking links for campaigns.
            </Text>
          </Box>
          <Group gap="sm">
            <Badge variant="light" color="gray">
              {qrCodes.length} shown
            </Badge>
            <Button component={Link} href="/qr/new" leftSection={<Icon name="plus" className="h-4 w-4" />}>
              New QR code
            </Button>
          </Group>
        </Group>
      </Card>

      <SimpleGrid cols={{ base: 1, sm: 2, xl: 4 }} spacing="md">
        <MetricCard icon="qr" label="Total codes" value={totalCodes} detail="All campaigns" />
        <MetricCard icon="scan" label="Active" value={activeCodes} detail="Live and editable" />
        <MetricCard icon="archive" label="Archived" value={archivedCodes} detail="Hidden from active work" />
        <MetricCard icon="barChart" label="30-day scans" value={scansLast30} detail="Across every QR" />
      </SimpleGrid>

      <Paper component="form" method="get" withBorder p="md" radius="lg">
        <SimpleGrid cols={{ base: 1, md: 5 }} spacing="sm">
          <TextInput
            name="q"
            defaultValue={params.q}
            placeholder="Search label or slug"
            leftSection={<Icon name="search" className="h-4 w-4" />}
          />
          <Select
            name="type"
            defaultValue={params.type ?? ""}
            data={[{ value: "", label: "All types" }, ...qrTypeValues.map((value) => ({ value, label: value }))]}
          />
          <TextInput name="tag" defaultValue={params.tag} placeholder="Tag" />
          <Select
            name="status"
            defaultValue={status}
            data={[
              { value: "ACTIVE", label: "Active" },
              { value: "ARCHIVED", label: "Archived" },
              { value: "ALL", label: "All" },
            ]}
          />
          <Button type="submit" variant="default" leftSection={<Icon name="filter" className="h-4 w-4" />}>
            Filter
          </Button>
        </SimpleGrid>
      </Paper>

      <Stack gap="sm">
        {qrCodes.map((qr) => {
          const style = styleConfigSchema.parse(qr.styleConfig);
          const trackingUrl = `${redirectBase}/q/${qr.slug}`;
          return (
            <Card key={qr.id} p="md">
              <Group justify="space-between" gap="md" align="center">
                <Group gap="md" wrap="nowrap" miw={0}>
                  <Box className="qr-thumb">
                    <QrPreview data={trackingUrl} style={style} size={58} />
                  </Box>
                  <Box miw={0}>
                    <Group gap="xs" wrap="nowrap">
                      <Text component={Link} href={`/qr/${qr.id}`} fw={700} c="dark.8" truncate className="plain-link">
                        {qr.label}
                      </Text>
                      <Badge size="sm" color={qr.status === "ACTIVE" ? "green" : "gray"} variant="light">
                        {qr.status.toLowerCase()}
                      </Badge>
                    </Group>
                    <Group gap="md" mt={6} c="dimmed" wrap="wrap">
                      <Group gap={5} wrap="nowrap">
                        <Icon name={typeIcon(qr.type)} className="h-3.5 w-3.5" />
                        <Text size="sm">{qr.type}</Text>
                      </Group>
                      <Group gap={5} wrap="nowrap">
                        <Icon name="link" className="h-3.5 w-3.5" />
                        <Code>{qr.slug}</Code>
                      </Group>
                      {qr.tags.length > 0 ? (
                        <Group gap={5} wrap="nowrap">
                          <Icon name="tag" className="h-3.5 w-3.5" />
                          <Text size="sm" truncate maw={280}>
                            {qr.tags.join(", ")}
                          </Text>
                        </Group>
                      ) : null}
                    </Group>
                  </Box>
                </Group>

                <Group gap="xs" justify="flex-end">
                  <Button component={Link} href={`/qr/${qr.id}`} variant="default" size="xs" leftSection={<Icon name="externalLink" className="h-3.5 w-3.5" />}>
                    Open
                  </Button>
                  <ActionIcon component={Link} href={`/qr/${qr.id}/edit`} variant="subtle" color="gray" aria-label={`Edit ${qr.label}`}>
                    <Icon name="edit" className="h-4 w-4" />
                  </ActionIcon>
                  <form action={cloneQrCode.bind(null, qr.id)}>
                    <ActionIcon type="submit" variant="subtle" color="gray" aria-label={`Clone ${qr.label}`}>
                      <Icon name="clone" className="h-4 w-4" />
                    </ActionIcon>
                  </form>
                  <form action={setQrStatus.bind(null, qr.id, qr.status === "ACTIVE" ? "ARCHIVED" : "ACTIVE")}>
                    <ActionIcon type="submit" variant="subtle" color="gray" aria-label={qr.status === "ACTIVE" ? `Archive ${qr.label}` : `Unarchive ${qr.label}`}>
                      <Icon name="archive" className="h-4 w-4" />
                    </ActionIcon>
                  </form>
                  <form action={deleteQrCode.bind(null, qr.id)}>
                    <ActionIcon type="submit" variant="subtle" color="red" aria-label={`Delete ${qr.label}`}>
                      <Icon name="trash" className="h-4 w-4" />
                    </ActionIcon>
                  </form>
                </Group>
              </Group>
            </Card>
          );
        })}
        {qrCodes.length === 0 ? (
          <Paper withBorder p="xl" radius="lg" ta="center">
            <ThemeIcon size="xl" radius="xl" variant="light" color="blue" mx="auto" mb="md">
              <Icon name="search" className="h-5 w-5" />
            </ThemeIcon>
            <Title order={3} size="h4">
              No QR codes found
            </Title>
            <Text c="dimmed" mt="xs">
              Adjust the filters or create a new dynamic code.
            </Text>
            <Button component={Link} href="/qr/new" mt="md" leftSection={<Icon name="plus" className="h-4 w-4" />}>
              Create QR code
            </Button>
          </Paper>
        ) : null}
      </Stack>
    </Stack>
  );
}

function MetricCard({ icon, label, value, detail }: { icon: IconName; label: string; value: string | number; detail: string }) {
  return (
    <Card p="md">
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Box>
          <Text size="sm" c="dimmed" fw={600}>
            {label}
          </Text>
          <Title order={2} mt={4}>
            {value}
          </Title>
          <Text size="xs" c="dimmed" mt={2}>
            {detail}
          </Text>
        </Box>
        <ThemeIcon variant="light" color="blue" radius="md">
          <Icon name={icon} className="h-4 w-4" />
        </ThemeIcon>
      </Group>
    </Card>
  );
}

function typeIcon(type: string): IconName {
  switch (type) {
    case "URL":
      return "globe";
    case "VCARD":
      return "shield";
    case "WIFI":
      return "wifi";
    case "TEXT":
      return "type";
    case "EMAIL":
      return "mail";
    case "PHONE":
      return "phone";
    default:
      return "qr";
  }
}
