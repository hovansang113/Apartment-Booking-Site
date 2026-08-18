import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Stayhub';

export default function Seo({ title, description, path = '/', jsonLd, noindex = false }) {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — Book stays across the UK`;
  // window.location.origin - luon dung theo domain/IP that dang phuc vu trang
  // (dev, staging, production...), khong can hardcode/config rieng tung noi.
  // SPA thuan (khong SSR) nen component nay chi render trong trinh duyet,
  // `window` luon co san.
  const url = `${window.location.origin}${path}`;

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
