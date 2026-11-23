import type { LayerId } from '../lib/projects';

export interface Layer {
  id: LayerId;
  /** 01 is the bottom of the stack. */
  n: string;
  name: string;
  /** What the layer is, in a line. */
  line: string;
  /** What working there means to me, in a sentence. */
  blurb: string;
  /** From professional work at Wonderbiz, where there is something specific to say. */
  atWork?: string;
  tech: string[];
}

/**
 * The five layers, bottom → top. The hero draws them, the Layers section expands them, the mark
 * lights them, and every project names the ones it works in (`layers` in its content file).
 */
export const LAYERS: Layer[] = [
  {
    id: 'machine',
    n: '01',
    name: 'Machine',
    line: 'Devices, operating systems, industrial automation',
    blurb:
      'Where software meets hardware: device registers, system counters, disks, screens and the OS underneath. Code here has to stay honest when the link, the power or the user does something unexpected.',
    atWork: 'Real-time device and telemetry data over Modbus, turned into observability flows where a stale reading has to look stale.',
    tech: ['Modbus', 'IoT', 'Telemetry', 'Rust', 'Swift', 'C#', 'Windows', 'macOS', 'Linux'],
  },
  {
    id: 'infrastructure',
    n: '02',
    name: 'Infrastructure',
    line: 'Containers, caches, gateways, self-hosting',
    blurb:
      'What everything else stands on. I like infrastructure I can run myself and reason about completely: one source of truth, disposable state kept disposable, and failure modes chosen on purpose.',
    atWork: 'Event-driven interfaces and WebSockets that keep feedback current between devices and the screens watching them.',
    tech: ['Linux', 'Docker', 'Redis', 'PostgreSQL', 'Traefik', 'Cloudflare Workers', 'WebSockets'],
  },
  {
    id: 'software',
    n: '03',
    name: 'Software',
    line: 'Services, APIs, integrations',
    blurb:
      'Application services built around clear contracts, with identity and integration handled as platform concerns instead of per-team folklore. The language follows the problem.',
    atWork: 'Backend and integration layers in .NET Core, Node.js and Python, with SSO, IAM and OAuth wired into the platform.',
    tech: ['C# / .NET Core', 'Python', 'Node.js', 'Go', 'Rust', 'GraphQL', 'REST', 'OAuth / SSO'],
  },
  {
    id: 'intelligence',
    n: '04',
    name: 'Intelligence',
    line: 'LLMs, agents, AI-assisted engineering',
    blurb:
      'Models treated as components, not magic: routed, metered, reviewed and kept on infrastructure you control. Most of my AI work is about making engineers faster without handing over the keys.',
    atWork: 'NLP-driven automation inside production software.',
    tech: ['LLM routing', 'Multi-agent pipelines', 'OpenAI', 'Anthropic', 'Ollama', 'Transformers', 'Prompt pipelines'],
  },
  {
    id: 'interface',
    n: '05',
    name: 'Interface',
    line: 'Web apps, extensions, editors, terminals',
    blurb:
      'The last metre, where a person decides whether the system works. Interfaces that make state obvious at a glance, wherever the person already is: the browser, the editor or the terminal.',
    atWork: 'Modular webshell and microfrontend architecture, so teams deploy independently without fragmenting the experience.',
    tech: ['React', 'TypeScript', 'Angular', 'Single-SPA', 'Microfrontends', 'WebExtensions', 'VS Code API', 'TUIs'],
  },
];

export const layerById = new Map(LAYERS.map((layer) => [layer.id, layer]));

/** Top → bottom, the order a cross-section is read in. */
export const LAYERS_TOP_DOWN = [...LAYERS].reverse();
