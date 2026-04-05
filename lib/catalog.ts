import { defineCatalog, defineSchema } from "@json-render/core";
import { z } from "zod";

const style = z
  .object({
    color: z.string().optional().describe("Text color (hex, rgb, or CSS name)"),
    backgroundColor: z.string().optional().describe("Background color"),
    backgroundImage: z.string().optional().describe("Background image URL or gradient"),
    border: z.string().optional().describe("CSS border shorthand (e.g. '1px solid #ccc')"),
    borderRadius: z.string().optional().describe("Border radius (e.g. '8px', '50%')"),
    padding: z.string().optional().describe("CSS padding shorthand"),
    margin: z.string().optional().describe("CSS margin shorthand"),
    fontSize: z.string().optional().describe("Font size (e.g. '16px', '1rem')"),
    fontWeight: z.union([z.string(), z.number()]).optional().describe("Font weight"),
    textAlign: z.enum(["left", "center", "right", "justify"]).optional(),
    gap: z.string().optional().describe("Flex/grid gap"),
    width: z.string().optional(),
    maxWidth: z.string().optional(),
    height: z.string().optional(),
    boxShadow: z.string().optional(),
    opacity: z.number().min(0).max(1).optional(),
  })
  .optional()
  .describe("Visual style extracted from the source page");

const schema = defineSchema((s) => ({
  spec: s.object({
    root: s.object({
      type: s.ref("catalog.components"),
      props: s.propsOf("catalog.components"),
      children: s.array(s.string()),
    }),
  }),
  catalog: s.object({
    components: s.map({
      props: s.zod(),
      description: s.string(),
    }),
  }),
}));

export const catalog = defineCatalog(schema, {
  components: {
    Page: {
      description: "Root container for the entire page",
      props: z.object({
        title: z.string().describe("The page title (from <title> or og:title)"),
        description: z.string().optional().describe("Meta description of the page"),
        url: z.string().describe("The original URL of the page"),
        favicon: z.string().optional().describe("URL to the site favicon"),
        style,
      }),
    },
    Nav: {
      description: "Top navigation bar",
      props: z.object({
        brand: z.string().describe("Site name or logo alt text"),
        links: z.array(z.object({ label: z.string(), href: z.string() })).describe("Navigation links"),
        style,
      }),
    },
    Hero: {
      description: "Full-width hero / banner section at the top of the page",
      props: z.object({
        headline: z.string().describe("Primary headline text"),
        subheadline: z.string().optional().describe("Supporting subtitle"),
        backgroundImage: z.string().optional().describe("URL of background image"),
        cta: z.object({ label: z.string(), href: z.string() }).optional().describe("Primary call-to-action button"),
        style,
      }),
    },
    Section: {
      description: "Generic page section container grouping related content",
      props: z.object({
        id: z.string().optional().describe("Section anchor id"),
        label: z.string().optional().describe("Section heading / label visible to users"),
        style,
      }),
    },
    Heading: {
      description: "Text heading element",
      props: z.object({
        text: z.string(),
        level: z.enum(["h1", "h2", "h3", "h4", "h5", "h6"]),
        style,
      }),
    },
    Text: {
      description: "Paragraph of plain text content",
      props: z.object({
        content: z.string().describe("The paragraph text"),
        style,
      }),
    },
    Image: {
      description: "An image element",
      props: z.object({
        src: z.string().describe("Image URL"),
        alt: z.string().describe("Alt text"),
        caption: z.string().optional(),
        style,
      }),
    },
    Card: {
      description: "A content card with title, optional image, body text, and optional link",
      props: z.object({
        title: z.string(),
        body: z.string().describe("Short description or excerpt"),
        image: z.string().optional().describe("Card image URL"),
        link: z.string().optional().describe("URL the card links to"),
        badge: z.string().optional().describe("Small label/badge (e.g. category tag)"),
        style,
      }),
    },
    CardGrid: {
      description: "A responsive grid of Card components",
      props: z.object({
        columns: z.number().int().min(1).max(6).describe("Number of columns in the grid"),
        style,
      }),
    },
    Button: {
      description: "A call-to-action button or link",
      props: z.object({
        label: z.string(),
        href: z.string().optional(),
        variant: z.enum(["primary", "secondary", "outline", "ghost"]).optional(),
        style,
      }),
    },
    List: {
      description: "An ordered or unordered list",
      props: z.object({
        items: z.array(z.string()),
        ordered: z.boolean().optional(),
        style,
      }),
    },
    Table: {
      description: "A data table",
      props: z.object({
        headers: z.array(z.string()),
        rows: z.array(z.array(z.string())),
        style,
      }),
    },
    Testimonial: {
      description: "A user testimonial or quote block",
      props: z.object({
        quote: z.string(),
        author: z.string(),
        role: z.string().optional(),
        avatar: z.string().optional(),
        style,
      }),
    },
    Feature: {
      description: "A product/service feature highlight with icon and text",
      props: z.object({
        title: z.string(),
        description: z.string(),
        icon: z.string().optional().describe("Icon name or emoji"),
        style,
      }),
    },
    Pricing: {
      description: "A pricing tier card",
      props: z.object({
        name: z.string().describe("Plan name"),
        price: z.string().describe("Price string (e.g. '$29/mo')"),
        features: z.array(z.string()),
        cta: z.object({ label: z.string(), href: z.string() }).optional(),
        highlighted: z.boolean().optional().describe("Whether this is the recommended plan"),
        style,
      }),
    },
    Footer: {
      description: "Page footer with copyright and links",
      props: z.object({
        copyright: z.string(),
        links: z.array(z.object({ label: z.string(), href: z.string() })).optional(),
        socialLinks: z.array(z.object({ platform: z.string(), href: z.string() })).optional(),
        style,
      }),
    },
  },
});

export type SiteCatalog = typeof catalog;
