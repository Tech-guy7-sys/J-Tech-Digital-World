const AI_PROVIDERS = [
  { id: "openrouter", name: "Jeff AI free models", secrets: ["OPENROUTER_API_KEY"] },
  { id: "google-ai-studio", name: "Google AI Studio / Gemini", secrets: ["GEMINI_API_KEY"] },
  { id: "anthropic", name: "Anthropic Claude", secrets: ["ANTHROPIC_API_KEY"] }
];
const CONNECTORS = [
  ["github","GitHub","Developer tools","Repositories, branches, issues and pull requests","read","GitHub OAuth app + callback URL"],
  ["google-drive","Google Drive","Google","Search and read files the user authorises","read","Google Cloud OAuth client + consent screen"],
  ["gmail","Gmail","Google","Search messages and prepare drafts; sending requires separate approval","read","Google Cloud OAuth client + Gmail scopes"],
  ["google-calendar","Google Calendar","Google","Read calendars and create approved events","read-write","Google Cloud OAuth client + Calendar scopes"],
  ["discord","Discord","Messaging","Read approved server/channel context and send approved messages","read-write","Discord OAuth application + bot permissions"],
  ["slack","Slack","Messaging","Search workspace content and send approved messages","read-write","Slack app + OAuth scopes"],
  ["notion","Notion","Knowledge","Search and update pages explicitly shared with the integration","read-write","Notion public integration"],
  ["dropbox","Dropbox","Cloud storage","Search and manage authorised files","read-write","Dropbox OAuth app"],
  ["onedrive","OneDrive","Microsoft","Search and manage authorised files","read-write","Microsoft Entra app registration"],
  ["sharepoint","SharePoint","Microsoft","Access selected sites and documents","read","Microsoft Entra app registration + admin consent where required"],
  ["microsoft-teams","Microsoft Teams","Microsoft","Access approved team and channel workflows","read-write","Microsoft Entra app registration + Graph permissions"],
  ["linear","Linear","Project management","Read and update assigned issues","read-write","Linear OAuth app"],
  ["jira","Jira","Project management","Read and update selected projects and issues","read-write","Atlassian OAuth app"],
  ["trello","Trello","Project management","Read and update selected boards and cards","read-write","Trello Power-Up/API credentials"],
  ["figma","Figma","Design","Find and inspect files available to the user","read","Figma OAuth app"],
  ["canva","Canva","Design","Access approved designs and exports","read-write","Canva Connect API app"],
  ["hubspot","HubSpot","Business","Read and update authorised CRM records","read-write","HubSpot developer app"],
  ["salesforce","Salesforce","Business","Read and update authorised CRM records","read-write","Salesforce connected app"],
  ["stripe","Stripe","Business","Read account data; financial mutations require explicit approval","read","Stripe restricted key or OAuth"],
  ["supabase","Supabase","Developer tools","Inspect selected projects and resources","read","Supabase access token stored server-side"],
  ["vercel","Vercel","Developer tools","Inspect projects and deployments","read","Vercel OAuth app or scoped token"],
  ["cloudflare","Cloudflare","Developer tools","Inspect Pages, Workers, DNS and D1 resources","read-write","Cloudflare scoped API token"],
  ["openai","OpenAI API","AI providers","Use configured models through JT AI Core","read","OPENAI_API_KEY server secret"],
  ["anthropic","Anthropic API","AI providers","Use Claude through JT AI Core","read","ANTHROPIC_API_KEY server secret"]
];
export async function onRequestGet({env}) {
  const providers = AI_PROVIDERS.map(p => ({id:p.id,name:p.name,configured:p.secrets.every(k=>Boolean(env?.[k])),requiredSecrets:p.secrets}));
  const connectors = CONNECTORS.map(([id,name,category,description,access,setup]) => ({
    id,name,category,description,access,
    status: id==="cloudflare" && Boolean(env?.CLOUDFLARE_API_TOKEN && env?.CLOUDFLARE_ACCOUNT_ID) ? "credentials_configured" : "setup_required",
    setup,
    available:false
  }));
  return new Response(JSON.stringify({
    product:"Jeff AI Connectors Hub",
    version:1,
    architecture:"server-side OAuth/API adapters with least-privilege scopes",
    providers,
    connectors,
    accountStorageConfigured:Boolean(env?.JT_AUTH_DB),
    connectorStorageConfigured:Boolean(env?.JT_AUTH_DB)
  }), {headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"}});
}
