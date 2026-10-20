import { useState } from 'react';
import { Card, Stack, Text, Heading, Flex, Button, Badge } from '@sanity/ui';
import { useClient } from 'sanity';
import imageUrlBuilder from '@sanity/image-url';

export function ContentPreview(props: { document: { displayed: Record<string, any> } }) {
  const [locale, setLocale] = useState<'tr' | 'en'>('tr');
  const doc = props.document.displayed;
  const client = useClient({ apiVersion: '2025-02-19' });
  const builder = imageUrlBuilder(client);
  const firstImage = doc.images?.[0] || doc.image;
  const title =
    doc.name?.[locale] ||
    doc.title?.[locale] ||
    (typeof doc.name === 'string' ? doc.name : 'Untitled');
  return (
    <Card padding={5}>
      <Stack style={{ gap: 24 }}>
        <Flex style={{ gap: 8 }}>
          <Button
            text="Türkçe"
            mode={locale === 'tr' ? 'default' : 'ghost'}
            onClick={() => setLocale('tr')}
          />
          <Button
            text="English"
            mode={locale === 'en' ? 'default' : 'ghost'}
            onClick={() => setLocale('en')}
          />
        </Flex>
        <Badge tone="caution">Authenticated draft preview · not a public page</Badge>
        <Text size={1} muted>
          Changes appear here inside your authenticated Studio session. Use a protected draft build
          to preview the full website.
        </Text>
        {firstImage?.asset && (
          <img
            src={builder.image(firstImage).width(1000).url()}
            alt={firstImage.alt?.[locale] || ''}
            style={{ width: '100%', maxHeight: 400, objectFit: 'cover' }}
          />
        )}
        <Heading size={3}>{String(title)}</Heading>
        {doc.sample && (
          <Text size={1}>Sample content — replace and verify before public launch.</Text>
        )}
        {(doc.summary?.[locale] || doc.excerpt?.[locale]) && (
          <Text size={2}>{doc.summary?.[locale] || doc.excerpt?.[locale]}</Text>
        )}
        {doc.description?.[locale] && <Text>{doc.description[locale]}</Text>}
        {doc.condition?.[locale] && <Text>{doc.condition[locale]}</Text>}
        {doc.year && (
          <Text>
            {doc.year} · {doc.hours?.toLocaleString(locale)} hours
          </Text>
        )}
        {doc.specs?.map((spec: any, i: number) => (
          <Card key={spec._key || i} padding={3} tone="transparent">
            <Flex justify="space-between" style={{ gap: 12 }}>
              <Text>{spec.label?.[locale]}</Text>
              <Text weight="semibold">{spec.value}</Text>
            </Flex>
          </Card>
        ))}
        {doc.sections?.map((section: any, i: number) => (
          <Stack key={section._key || i} style={{ gap: 12 }}>
            <Heading size={1}>{section.heading?.[locale]}</Heading>
            <Text>{section.text?.[locale]}</Text>
          </Stack>
        ))}
      </Stack>
    </Card>
  );
}
