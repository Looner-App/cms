import payload from 'payload';

import type { CustomRichTextElement } from './elements';

type Children = {
  bold?: boolean;
  code?: boolean;
  italic?: boolean;
  small?: boolean;
  strikethrough?: boolean;
  text?: string;
  underline?: boolean;
};

type Link = {
  children?: Children[];
  doc?: {
    customValue?: any;
    isHomepage?: boolean;
    relationTo: string;
    value: any;
  };
  linkType?: `custom` | `internal`;
  newTab?: boolean;
  url?: string;
};

type Media = {
  children?: Children[];
  customValue?: any;
  relationTo?: string;
  value?: any;
};

type Slate = {
  children?: Children[];
  textAlign?: `center` | `left` | `right`;
  type?: `li` | CustomRichTextElement;
} & Children &
  Link &
  Media;

export const parseLeaves = (node: Children) => {
  let text = node.text || ``;

  // nl2br
  text = text.replace(/\r\n|\r|\n/g, `<br />`);

  if (node.bold) {
    text = `<strong>${text}</strong>`;
  }

  if (node.italic) {
    text = `<em>${text}</em>`;
  }

  if (node.underline) {
    text = `<u>${text}</u>`;
  }

  if (node.strikethrough) {
    text = `<del>${text}</del>`;
  }

  if (node.code) {
    text = `<code>${text}</code>`;
  }

  if (node.small) {
    text = `<small>${text}</small>`;
  }

  return text;
};

export const parseLink = (node: Link) => {
  let href = ``;
  let siteUrl = process.env.PAYLOAD_PUBLIC_FRONTEND_URL;

  // Remove trailing slashes site url
  if (siteUrl) {
    siteUrl = siteUrl.replace(/^\/|\/$/g, ``);
  }

  switch (node.linkType) {
    case `internal`:
      if (node.doc.isHomepage == false) {
        href = node.doc.customValue.slug;
      }

      // TODO: prefix locale
      if (node.doc.relationTo === `media`) {
        href = node.doc.customValue.url;
      } else if (node.doc.relationTo !== `pages`) {
        href = `${siteUrl}/${node.doc.relationTo}/${href}`;
      } else {
        href = `${siteUrl}/${href}`;
      }

      break;

    case `custom`:
      href = node.url;

      // Parse plain url domain
      if (
        typeof href == `string` &&
        href[0] != `#` &&
        href[0] != `/` &&
        !href.includes(`http`) &&
        !href.includes(`mailto:`) &&
        !href.includes(`tel:`)
      ) {
        href = `//${href}`;
      }

      break;
  }

  let html = `<a href="${href}">${serialize(node.children)}</a>`;

  // Add target blank attribute
  if (node.newTab) {
    html = html.replace(/(^<[^<>]*)/, `$1 target="_blank"`);
  }

  return html;
};

export const parseMedia = (node: Media) => {
  let html = ``;
  const { mimeType, url, alt } = node.customValue;

  if (mimeType.includes(`image`)) {
    html = `<img src="${url}" alt="${alt}" width="100%" />`;
  } else {
    html = `<a href="${url}" target="_blank">${alt}</a>`;
  }

  return html;
};

export const parseDocs = async (slate: Slate[]) => {
  const childrens = [];

  const settings: any = await payload.findGlobal({ slug: `settings` });

  for (const item of slate) {
    // Loop again
    if (Array.isArray(item.children)) {
      item.children = await parseDocs(item.children).then();
    }

    // Get doc object
    if (item.type === `link` && item.linkType === `internal`) {
      item.doc.customValue = await payload.findByID({
        collection: item.doc.relationTo,
        id: item.doc.value,
      });

      // Check if is homepage
      item.doc.isHomepage = settings?.homePage?.id === item.doc.customValue.id;
    }

    // Get media object
    if (item.type === `upload`) {
      item.customValue = await payload.findByID({
        collection: item.relationTo,
        id: item.value.id,
      });
    }

    childrens.push(item);
  }

  return childrens;
};

export const serialize = (slate: Slate[]) => {
  let html = ``;

  slate.map(node => {
    if (typeof node.text === `string`) {
      html += parseLeaves(node);
    } else {
      let content = ``;

      switch (node.type) {
        case `h1`:
          content += `<h1>${serialize(node.children)}</h1>`;
          break;
        case `h2`:
          content += `<h2>${serialize(node.children)}</h2>`;
          break;
        case `h3`:
          content += `<h3>${serialize(node.children)}</h3>`;
          break;
        case `h4`:
          content += `<h4>${serialize(node.children)}</h4>`;
          break;
        case `h5`:
          content += `<h5>${serialize(node.children)}</h5>`;
          break;
        case `h6`:
          content += `<h6>${serialize(node.children)}</h6>`;
          break;
        case `ol`:
          content += `<ol>${serialize(node.children)}</ol>`;
          break;
        case `ul`:
          content += `<ul>${serialize(node.children)}</ul>`;
          break;
        case `li`:
          content += `<li>${serialize(node.children)}</li>`;
          break;
        case `blockquote`:
          content += `<blockquote>${serialize(node.children)}</blockquote>`;
          break;
        case `link`:
          content += parseLink(node);
          break;
        case `upload`:
          content += `<p>${parseMedia(node)}</p>`;
          break;
        case `label`:
          content += `<p class="rts-label">${serialize(node.children)}</p>`;
          break;
        case `large-body`:
          content += `<p class="rts-large-body">${serialize(node.children)}</p>`;
          break;
        // TODO: how should be appear in html
        // case `relationship`:
        //   break;
        case `indent`:
          content += `<span class="rts-indent">${serialize(node.children)}</span>`;
          break;
        default:
          content += `<p>${serialize(node.children)}</p>`;
          break;
      }

      // Add style text align
      switch (node.textAlign) {
        case `left`:
          content = content.replace(/(^<[^<>]*)/, `$1 style="text-align: left;"`);
          break;
        case `center`:
          content = content.replace(/(^<[^<>]*)/, `$1 style="text-align: center;"`);
          break;
        case `right`:
          content = content.replace(/(^<[^<>]*)/, `$1 style="text-align: right;"`);
          break;
      }

      html += content;
    }
  });

  return html;
};
