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
      'Code that runs close to the hardware or the operating system. In practice that means reading device data, sampling CPU and memory, cleaning up disk space and redacting parts of a screen capture.',
    atWork: 'Real-time device and telemetry data over Modbus, and the monitoring built on top of it.',
    tech: ['Modbus', 'IoT', 'Telemetry', 'Rust', 'Swift', 'C#', 'Windows', 'macOS', 'Linux'],
  },
  {
    id: 'infrastructure',
    n: '02',
    name: 'Infrastructure',
    line: 'Containers, caches, gateways, self-hosting',
    blurb:
      'What everything else runs on. I prefer setups I can host and fully understand, usually with one database as the source of truth and anything temporary kept in a cache.',
    atWork: 'Event-driven interfaces and WebSockets that keep device data up to date on screen.',
    tech: ['Linux', 'Docker', 'Redis', 'PostgreSQL', 'Traefik', 'Cloudflare Workers', 'WebSockets'],
  },
  {
    id: 'software',
    n: '03',
    name: 'Software',
    line: 'Services, APIs, integrations',
    blurb:
      'Backend services, APIs and integrations. The language depends on the project: mostly C#, Python and Node.js at work, plus Go and Rust in my own projects.',
    atWork: 'Backend and integration layers in .NET Core, Node.js and Python, including SSO, IAM and OAuth.',
    tech: ['C# / .NET Core', 'Python', 'Node.js', 'Go', 'Rust', 'GraphQL', 'REST', 'OAuth / SSO'],
  },
  {
    id: 'intelligence',
    n: '04',
    name: 'Intelligence',
    line: 'LLMs, agents, AI-assisted engineering',
    blurb:
      'Mostly LLM tooling for developers: a gateway that routes requests across model providers, a self-hosted code reviewer and a multi-agent tool for auditing repositories.',
    atWork: 'NLP-based automation in production software.',
    tech: ['LLM routing', 'Multi-agent pipelines', 'OpenAI', 'Anthropic', 'Ollama', 'Transformers', 'Prompt pipelines'],
  },
  {
    id: 'interface',
    n: '05',
    name: 'Interface',
    line: 'Web apps, extensions, editors, terminals',
    blurb:
      'Web apps, browser and VS Code extensions, and terminal UIs. I like interfaces that show the state of a system clearly without making you dig for it.',
    atWork: 'A modular webshell and microfrontend architecture that lets teams deploy independently.',
    tech: ['React', 'TypeScript', 'Angular', 'Single-SPA', 'Microfrontends', 'WebExtensions', 'VS Code API', 'TUIs'],
  },
];

export const layerById = new Map(LAYERS.map((layer) => [layer.id, layer]));

/** Top → bottom, the order a cross-section is read in. */
export const LAYERS_TOP_DOWN = [...LAYERS].reverse();
