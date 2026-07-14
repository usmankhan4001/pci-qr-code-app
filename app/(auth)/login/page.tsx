import Image from "next/image";
import { Box, Card, Center, Group, SimpleGrid, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import LoginForm from "./login-form";
import { Icon, type IconName } from "@/components/ui-icons";
import brandLogo from "../../../premierchoice brandign/Logo.webp";
import coverImage from "../../../premierchoice brandign/premier_choice_international_cover.jpeg";

const loginHighlights: Array<{ icon: IconName; text: string }> = [
  { icon: "qr", text: "Readable dynamic links" },
  { icon: "palette", text: "Controlled PCI templates" },
  { icon: "barChart", text: "Scan analytics" },
];

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const { callbackUrl } = await searchParams;

  return (
    <Center mih="100vh" p="md" bg="gray.0">
      <Card maw={1040} w="100%" p={0} radius="xl" withBorder shadow="sm" className="login-card">
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing={0}>
          <Box className="login-brand-panel" visibleFrom="md">
            <Stack justify="space-between" h="100%" p="xl">
              <Box>
                <Box className="login-logo-box">
                  <Image src={brandLogo} alt="Premier Choice International" className="login-logo" priority />
                </Box>
                <Text size="xs" fw={800} tt="uppercase" c="gray.5" lts="0.12em" mt="xl">
                  Internal QR operations
                </Text>
                <Title order={1} mt="md" c="white" maw={430}>
                  Dynamic QR management for PCI campaigns.
                </Title>
                <Text c="gray.4" mt="md" maw={420}>
                  Create, govern, export, and measure branded QR assets without rebuilding printed materials.
                </Text>
                <Stack gap="sm" mt="xl">
                  {loginHighlights.map(({ icon, text }) => (
                    <Group key={text} gap="sm" className="login-highlight" wrap="nowrap">
                      <ThemeIcon color="blue" variant="light" radius="md">
                        <Icon name={icon} className="h-4 w-4" />
                      </ThemeIcon>
                      <Text size="sm" c="gray.2" fw={600}>
                        {text}
                      </Text>
                    </Group>
                  ))}
                </Stack>
              </Box>

              <Box className="login-cover-wrap">
                <Image src={coverImage} alt="Premier Choice International property development skyline" className="login-cover" priority />
              </Box>
            </Stack>
          </Box>

          <Stack p={{ base: "lg", sm: "xl" }} justify="center" gap="lg" mih={560}>
            <Box hiddenFrom="md" className="login-logo-box light">
              <Image src={brandLogo} alt="Premier Choice International" className="login-logo" priority />
            </Box>
            <Box>
              <Text size="xs" fw={800} tt="uppercase" c="dimmed" lts="0.08em">
                Staff sign in
              </Text>
              <Title order={1} size="h2" mt={6}>
                Premier Choice International
              </Title>
              <Text c="dimmed" mt="xs">
                Access QR Studio to create codes, edit destinations, and review scan activity.
              </Text>
            </Box>
            <LoginForm callbackUrl={callbackUrl} />
          </Stack>
        </SimpleGrid>
      </Card>
    </Center>
  );
}
