import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Stayhub';
const SITE_URL = 'https://example.com'; // TODO: doi thanh domain that khi deploy

export default function Seo({ title, description, path = '/', jsonLd, noindex = false }) {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — Đặt phòng khắp Việt Nam`;
  const url = `${SITE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={url} />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={url} />
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
}
