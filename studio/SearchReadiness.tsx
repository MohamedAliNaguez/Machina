import { useEffect, useState } from 'react';
import { Card, Stack, Text, Heading, Badge } from '@sanity/ui';
import { useClient } from 'sanity';
import {
  companySearchIssues,
  categorySearchIssues,
  articleSearchIssues,
  productSearchIssues,
  seoIssues,
} from '../src/lib/seo-policy';
import type { Article, Category, Content, Machine, Settings } from '../src/lib/types';

export function SearchReadiness(props: { document: { displayed: Record<string, any> } }) {
  const doc = props.document.displayed;
  const client = useClient({ apiVersion: '2025-02-19' });
  const [settings, setSettings] = useState<Settings | null>(null);
  useEffect(() => {
    let active = true;
    client.fetch<Settings>('*[_id=="siteSettings"][0]').then((value) => {
      if (active) setSettings(value);
    });
    return () => {
      active = false;
    };
  }, [client]);
  const company = doc._type === 'siteSettings' ? (doc as Settings) : settings;
  const common = company
    ? companySearchIssues({ settings: company } as Content)
    : ['Loading company checks'];
  return (
    <Card padding={5}>
      <Stack style={{ gap: 32 }}>
        <Heading size={2}>Search readiness</Heading>
        <Text size={1}>
          Publishing and search approval are separate. The website also checks HTTPS and enquiry
          configuration at release. This panel never approves content automatically.
        </Text>
        <Badge tone="caution">
          Public dataset · keep confidential provenance outside this editor
        </Badge>
        {(['en', 'tr'] as const).map((locale) => {
          let issues = [...common];
          if (!company?.about?.[locale]?.trim())
            issues.push('Add the approved company description');
          if (!company?.privacyNotice?.[locale]?.trim())
            issues.push('Add the reviewed privacy notice');
          if (doc._type === 'category')
            issues.push(...categorySearchIssues(doc as Category, locale));
          else if (doc._type === 'article')
            issues.push(
              ...articleSearchIssues(
                {
                  ...doc,
                  imageAlt: doc.image?.alt,
                  published: doc.published || [],
                  sections: doc.sections || [],
                } as Article,
                locale,
              ),
            );
          else if (['newModel', 'usedMachine'].includes(doc._type))
            issues.push(
              ...productSearchIssues(
                {
                  ...doc,
                  kind: doc._type === 'newModel' ? 'new' : 'used',
                  published: doc.published || [],
                  specs: doc.specs || [],
                  images: doc.images || [],
                } as Machine,
                locale,
              ),
            );
          else if (doc._type === 'siteSettings')
            for (const page of ['home', 'about', 'contact'] as const) {
              issues.push(
                ...seoIssues(doc.pageSeo?.[page], locale).map((issue) => `${page}: ${issue}`),
              );
              if (page === 'about' && !doc.historyApproved)
                issues.push('about: Review the visible company history');
            }
          return (
            <Stack key={locale} style={{ gap: 16 }}>
              <Heading size={1}>{locale === 'en' ? 'English' : 'Türkçe'}</Heading>
              <Badge tone={issues.length ? 'caution' : 'positive'}>
                {issues.length
                  ? `${issues.length} pending checks`
                  : 'Content checks passed · deployment checks remain'}
              </Badge>
              {issues.map((issue, index) => (
                <Text size={1} key={index}>
                  • {issue}
                </Text>
              ))}
            </Stack>
          );
        })}
      </Stack>
    </Card>
  );
}
