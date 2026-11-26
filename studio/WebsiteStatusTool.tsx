import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, Flex, Heading, Spinner, Stack, Text } from '@sanity/ui';
import { useClient } from 'sanity';

type Status = 'online' | 'maintenance';
type StatusDocument = { _id: string; _rev: string; status: Status; _updatedAt: string };
const documentId = 'websiteAvailability';
export function WebsiteStatusTool() {
  const baseClient = useClient({ apiVersion: '2025-02-19' });
  const client = useMemo(
    () =>
      baseClient.withConfig({
        useCdn: false,
        perspective: 'published',
      }),
    [baseClient],
  );
  const [document, setDocument] = useState<StatusDocument | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const load = useCallback(async () => {
    try {
      const value = await client.getDocument<StatusDocument>(documentId);
      if (!value || !['online', 'maintenance'].includes(value.status))
        throw new Error('Website control is not configured. Contact your technical maintainer.');
      setDocument(value);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not read the website status.');
    }
  }, [client]);
  useEffect(() => {
    void load();
    const interval = setInterval(() => void load(), 15000);
    return () => clearInterval(interval);
  }, [load]);
  const change = async (status: Status) => {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const current = await client.getDocument<StatusDocument>(documentId);
      if (!current?._rev) throw new Error('Website control was not found. No changes were made.');
      const updated = await client
        .patch(documentId)
        .ifRevisionId(current._rev)
        .set({ status })
        .commit<StatusDocument>();
      setDocument(updated);
      setNotice(
        status === 'maintenance'
          ? 'Maintenance selected. Visitors will see the maintenance page within about 30 seconds. Email, phone and WhatsApp remain available.'
          : 'Online selected. The existing website will return within about 30 seconds. No deployment is required.',
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The change could not be saved. Try again.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <Card padding={[4, 5]} height="fill" overflow="auto">
      <Stack style={{ gap: 32, maxWidth: 780, margin: '0 auto', paddingTop: 32 }}>
        <Stack style={{ gap: 20 }}>
          <Text muted size={1}>
            TECHNICSAN / WEBSITE CONTROL
          </Text>
          <Heading size={3}>Website status</Heading>
          <Text muted>
            Control what visitors see at technicsan.com. This is separate from content publishing,
            deployment and search approval.
          </Text>
        </Stack>
        <Card padding={4} border radius={3}>
          <Stack style={{ gap: 24 }}>
            <Flex align="center" gap={3}>
              <Text weight="semibold">Saved status</Text>
              {document ? (
                <Badge tone={document.status === 'online' ? 'positive' : 'caution'}>
                  {document.status === 'online' ? 'Online' : 'Maintenance'}
                </Badge>
              ) : (
                <Spinner />
              )}
            </Flex>
            <Text>
              {document?.status === 'maintenance'
                ? 'Visitors receive a branded maintenance page with your contact details. Your pages and content remain intact.'
                : 'Visitors can browse the current published website and send enquiries.'}
            </Text>
            <Flex gap={3} wrap="wrap">
              <Button
                text="Bring website online"
                tone="positive"
                mode={document?.status === 'online' ? 'ghost' : 'default'}
                disabled={busy || !document || document.status === 'online'}
                onClick={() => void change('online')}
              />
              <Button
                text="Switch to maintenance"
                tone="caution"
                mode={document?.status === 'maintenance' ? 'ghost' : 'default'}
                disabled={busy || !document || document.status === 'maintenance'}
                onClick={() => void change('maintenance')}
              />
            </Flex>
            {busy && <Text size={1}>Saving website status…</Text>}
            <div role="status" aria-live="polite">
              {notice && <Text size={1}>{notice}</Text>}
            </div>
            <div role="alert">{error && <Text size={1}>{error}</Text>}</div>
            <Flex gap={3} wrap="wrap">
              <Button
                text="Refresh saved status"
                mode="bleed"
                disabled={busy}
                onClick={() => void load()}
              />
              <Button
                as="a"
                href="https://technicsan.com/en/"
                target="_blank"
                rel="noopener noreferrer"
                text="Check public website"
                mode="bleed"
              />
            </Flex>
          </Stack>
        </Card>
        <Stack style={{ gap: 20 }}>
          <Text size={1} muted>
            Maintenance does not delete content, change your domain or interrupt your email service.
            It also stays selected through future deployments until you bring the website online
            again.
          </Text>
          <Text size={1} muted>
            This pauses the public website; it does not make uploaded files private. Use maintenance
            for short interruptions. Long downtime can affect search visibility.
          </Text>
        </Stack>
      </Stack>
    </Card>
  );
}
