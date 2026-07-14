"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ActionIcon,
  AppShell,
  Avatar,
  Badge,
  Box,
  Burger,
  Button,
  Divider,
  Group,
  NavLink,
  Paper,
  ScrollArea,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Icon, type IconName } from "@/components/ui-icons";
import brandLogo from "../premierchoice brandign/Logo.webp";

const navItems: Array<{ href: string; label: string; description: string; icon: IconName; active: (pathname: string) => boolean }> = [
  {
    href: "/dashboard",
    label: "Library",
    description: "Manage live codes",
    icon: "grid",
    active: (pathname) => pathname === "/dashboard" || (pathname.startsWith("/qr/") && !pathname.startsWith("/qr/new")),
  },
  {
    href: "/qr/new",
    label: "Create QR",
    description: "Build a new asset",
    icon: "plus",
    active: (pathname) => pathname.startsWith("/qr/new"),
  },
  {
    href: "/templates",
    label: "Templates",
    description: "Brand presets",
    icon: "palette",
    active: (pathname) => pathname.startsWith("/templates"),
  },
];

type MantineShellProps = {
  children: React.ReactNode;
  email?: string | null;
  signOutAction: () => Promise<void>;
};

export function MantineShell({ children, email, signOutAction }: MantineShellProps) {
  const [opened, { toggle, close }] = useDisclosure(false);
  const pathname = usePathname();

  const nav = (
    <Stack gap="xs">
      {navItems.map((item) => (
        <NavLink
          key={item.href}
          component="a"
          href={item.href}
          active={item.active(pathname)}
          label={item.label}
          description={item.description}
          leftSection={<Icon name={item.icon} className="h-4 w-4" />}
          onClick={close}
          variant="filled"
          styles={{
            root: { borderRadius: 12 },
            label: { fontWeight: 700 },
            description: { fontSize: 12 },
          }}
        />
      ))}
    </Stack>
  );

  return (
    <AppShell
      header={{ height: 68 }}
      navbar={{ width: 292, breakpoint: "md", collapsed: { mobile: !opened } }}
      padding="lg"
      bg="gray.0"
    >
      <AppShell.Header withBorder>
        <Group h="100%" px="lg" justify="space-between" wrap="nowrap">
          <Group gap="md" wrap="nowrap">
            <Burger opened={opened} onClick={toggle} hiddenFrom="md" size="sm" aria-label="Toggle navigation" />
            <a href="/dashboard" className="brand-link">
              <Box className="brand-logo-box">
                <Image src={brandLogo} alt="Premier Choice International" className="brand-logo" priority />
              </Box>
              <Box visibleFrom="xs">
                <Title order={4} lh={1} fw={700} c="dark.8">
                  QR Studio
                </Title>
                <Text size="xs" c="dimmed" fw={600} mt={2}>
                  Dynamic campaign assets
                </Text>
              </Box>
            </a>
          </Group>

          <Group gap="sm" wrap="nowrap">
            <Badge color="green" variant="light" visibleFrom="sm">
              Production
            </Badge>
            <form action={signOutAction}>
              <ActionIcon variant="subtle" color="gray" size="lg" type="submit" aria-label="Sign out">
                <Icon name="logOut" className="h-4 w-4" />
              </ActionIcon>
            </form>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack h="100%" gap="lg">
          <Paper withBorder radius="lg" p="md" bg="dark.8" c="white">
            <Group gap="sm" wrap="nowrap">
              <Avatar color="blue" radius="xl">
                {(email?.[0] ?? "P").toUpperCase()}
              </Avatar>
              <Box miw={0}>
                <Text size="sm" fw={700} truncate>
                  PCI workspace
                </Text>
                <Text size="xs" c="gray.5" truncate>
                  {email ?? "Signed in"}
                </Text>
              </Box>
            </Group>
          </Paper>

          <Box>
            <Text size="xs" fw={800} tt="uppercase" c="dimmed" mb="xs" px="xs" lts="0.08em">
              Navigation
            </Text>
            {nav}
          </Box>

          <Box mt="auto">
            <Divider mb="md" />
            <Paper withBorder radius="lg" p="md" bg="gray.0">
              <Group gap="sm" align="flex-start" wrap="nowrap">
                <Box c="blue.7" mt={2}>
                  <Icon name="shield" className="h-4 w-4" />
                </Box>
                <Box>
                  <Text size="sm" fw={700}>
                    Trackable links
                  </Text>
                  <Text size="xs" c="dimmed" mt={3}>
                    New exports use readable slugs and remain editable after print.
                  </Text>
                </Box>
              </Group>
            </Paper>
            <form action={signOutAction}>
              <Button mt="md" fullWidth variant="default" leftSection={<Icon name="logOut" className="h-4 w-4" />} type="submit">
                Sign out
              </Button>
            </form>
          </Box>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <ScrollArea.Autosize type="never" mah="calc(100vh - 68px)">
          <Box maw={1320} mx="auto">
            {children}
          </Box>
        </ScrollArea.Autosize>
      </AppShell.Main>
    </AppShell>
  );
}
