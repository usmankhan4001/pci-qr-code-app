import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Badge,
  Box,
  Button,
  Card,
  Code,
  Divider,
  Grid,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { prisma } from "@/lib/prisma";
import { QrPreview } from "@/components/qr-preview";
import { Icon, type IconName } from "@/components/ui-icons";
import { styleConfigSchema } from "@/lib/qr-style";
import { cloneQrCode, setQrStatus } from "@/app/(app)/dashboard/actions";
import { getScanSummary, getScanTimeSeries, getDeviceBreakdown } from "@/lib/analytics";
import { ScanTimeSeriesChart, DeviceBreakdownChart } from "@/components/scan-charts";

export default async function QrDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const qr = await prisma.qrCode.findUnique({ where: { id } });
  if (!qr) notFound();

  const style = styleConfigSchema.parse(qr.styleConfig);
  const redirectBase = process.env.NEXT_PUBLIC_REDIRECT_BASE_URL ?? "";
  const trackingUrl = `${redirectBase}/q/${qr.slug}`;

  const [summary, series, breakdown] = await Promise.all([
    getScanSummary(qr.id),
    getScanTimeSeries(qr.id, 30),
    getDeviceBreakdown(qr.id),
  ]);

  return (
    <Grid gap="lg" align="flex-start">
      <Grid.Col span={{ base: 12, xl: 8 }}>
        <Stack gap="lg">
          <Card p="lg">
            <Group justify="space-between" align="flex-start" gap="md">
              <Box>
                <Group gap="xs" mb={4}>
                  <Text size="xs" fw={800} tt="uppercase" c="dimmed" lts="0.08em">
                    QR detail
                  </Text>
                  <Badge color={qr.status === "ACTIVE" ? "green" : "gray"} variant="light">
                    {qr.status.toLowerCase()}
                  </Badge>
                </Group>
                <Title order={1} size="h2">
                  {qr.label}
                </Title>
                <Text c="dimmed" mt="xs" maw={760}>
                  Review the destination, export print assets, and monitor scan activity for this dynamic code.
                </Text>
              </Box>
              <Group gap="sm">
                <Button component={Link} href={`/qr/${qr.id}/edit`} variant="default" leftSection={<Icon name="edit" className="h-4 w-4" />}>
                  Edit
                </Button>
                <form action={cloneQrCode.bind(null, qr.id)}>
                  <Button type="submit" variant="default" leftSection={<Icon name="clone" className="h-4 w-4" />}>
                    Clone
                  </Button>
                </form>
                <form action={setQrStatus.bind(null, qr.id, qr.status === "ACTIVE" ? "ARCHIVED" : "ACTIVE")}>
                  <Button type="submit" variant="default" leftSection={<Icon name="archive" className="h-4 w-4" />}>
                    {qr.status === "ACTIVE" ? "Archive" : "Unarchive"}
                  </Button>
                </form>
              </Group>
            </Group>
          </Card>

          <Card p="lg">
            <Group gap="xs" mb="md">
              <ThemeIcon variant="light" color="blue" radius="md">
                <Icon name="shield" className="h-4 w-4" />
              </ThemeIcon>
              <Box>
                <Title order={3} size="h4">
                  Code settings
                </Title>
                <Text size="sm" c="dimmed">
                  Operational details for this printed asset.
                </Text>
              </Box>
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
              <DetailItem icon="qr" label="Type" value={qr.type} />
              <DetailItem icon="scan" label="Status" value={qr.status} />
              <DetailItem icon="link" label="Tracking link" value={trackingUrl} wide mono />
              <DetailItem icon="externalLink" label="Destination" value={qr.destinationUrl} wide />
            </SimpleGrid>

            {qr.tags.length > 0 ? (
              <Group gap="xs" mt="md">
                {qr.tags.map((tag) => (
                  <Badge key={tag} color="gray" variant="light" leftSection={<Icon name="tag" className="h-3 w-3" />}>
                    {tag}
                  </Badge>
                ))}
              </Group>
            ) : null}
          </Card>

          <Box>
            <Group justify="space-between" mb="md">
              <Box>
                <Text size="xs" fw={800} tt="uppercase" c="dimmed" lts="0.08em">
                  Analytics
                </Text>
                <Title order={2} size="h3">
                  Scan analytics
                </Title>
              </Box>
              <Badge variant="light" color="gray">
                Last 30 days
              </Badge>
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mb="md">
              <StatTile icon="scan" label="Total scans" value={summary.total} />
              <StatTile icon="barChart" label="Last 7 days" value={summary.last7Days} />
              <StatTile icon="bolt" label="Last scan" value={summary.lastScanAt ? summary.lastScanAt.toLocaleDateString() : "No scans"} />
            </SimpleGrid>

            <Stack gap="md">
              <Card p="md">
                <Group gap="xs" mb="sm">
                  <Icon name="barChart" className="h-4 w-4" />
                  <Text size="sm" fw={700}>
                    Scans, last 30 days
                  </Text>
                </Group>
                <ScanTimeSeriesChart data={series} />
              </Card>

              <Card p="md">
                <Group gap="xs" mb="sm">
                  <Icon name="phone" className="h-4 w-4" />
                  <Text size="sm" fw={700}>
                    Scans by device
                  </Text>
                </Group>
                {breakdown.length > 0 ? <DeviceBreakdownChart data={breakdown} /> : <Text size="sm" c="dimmed">No scans yet.</Text>}
              </Card>
            </Stack>
          </Box>
        </Stack>
      </Grid.Col>

      <Grid.Col span={{ base: 12, xl: 4 }}>
        <Card p="lg" className="sticky-panel">
          <Group justify="space-between" mb="md">
            <Box>
              <Title order={3} size="h4">
                Print proof
              </Title>
              <Text size="sm" c="dimmed">
                Export exact assets for signs, flyers, or PDF packets.
              </Text>
            </Box>
            <Badge color="blue" variant="light">
              Ready
            </Badge>
          </Group>
          <Box className="qr-stage">
            <QrPreview data={trackingUrl} style={style} size={220} />
          </Box>
          <Code block mt="md" className="break-code">
            {trackingUrl}
          </Code>
          <Divider my="md" />
          <SimpleGrid cols={2} spacing="xs">
            <Button component="a" href={`/api/qr/${qr.id}/export?format=svg`} variant="default" leftSection={<Icon name="fileText" className="h-4 w-4" />}>
              SVG
            </Button>
            <Button component="a" href={`/api/qr/${qr.id}/export?format=png&size=512`} variant="default" leftSection={<Icon name="image" className="h-4 w-4" />}>
              PNG 512
            </Button>
            <Button component="a" href={`/api/qr/${qr.id}/export?format=png&size=1024`} variant="default" leftSection={<Icon name="image" className="h-4 w-4" />}>
              PNG 1024
            </Button>
            <Button component="a" href={`/api/qr/${qr.id}/export?format=png&size=2048`} variant="default" leftSection={<Icon name="image" className="h-4 w-4" />}>
              PNG 2048
            </Button>
            <Button component="a" href={`/api/qr/${qr.id}/export?format=pdf`} leftSection={<Icon name="download" className="h-4 w-4" />} className="span-2">
              PDF
            </Button>
          </SimpleGrid>
        </Card>
      </Grid.Col>
    </Grid>
  );
}

function DetailItem({ icon, label, value, wide = false, mono = false }: { icon: IconName; label: string; value: string; wide?: boolean; mono?: boolean }) {
  return (
    <PaperLike wide={wide}>
      <Group gap="xs" mb={4}>
        <Icon name={icon} className="h-3.5 w-3.5" />
        <Text size="xs" fw={800} tt="uppercase" c="dimmed" lts="0.06em">
          {label}
        </Text>
      </Group>
      <Text size={mono ? "xs" : "sm"} fw={mono ? 500 : 700} className={mono ? "break-code" : undefined} ff={mono ? "monospace" : undefined}>
        {value}
      </Text>
    </PaperLike>
  );
}

function StatTile({ icon, label, value }: { icon: IconName; label: string; value: string | number }) {
  return (
    <Card p="md">
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Box>
          <Text size="xs" fw={800} tt="uppercase" c="dimmed" lts="0.06em">
            {label}
          </Text>
          <Title order={3} mt={6}>
            {value}
          </Title>
        </Box>
        <ThemeIcon variant="light" color="blue" radius="md">
          <Icon name={icon} className="h-4 w-4" />
        </ThemeIcon>
      </Group>
    </Card>
  );
}

function PaperLike({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <Box className={wide ? "detail-cell detail-cell-wide" : "detail-cell"}>
      {children}
    </Box>
  );
}
