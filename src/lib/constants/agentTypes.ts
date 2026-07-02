export const AGENT_TYPE_OPTIONS = [
  { value: 'python_script', label: 'Python Script' },
  { value: 'php_script', label: 'PHP Script' },
  { value: 'wordpress_plugin', label: 'WordPress Plugin' },
] as const;

export type AgentTypeValue = (typeof AGENT_TYPE_OPTIONS)[number]['value'];

export const VALID_AGENT_TYPES = new Set<string>(AGENT_TYPE_OPTIONS.map(o => o.value));
