const PROVIDERS = [
  { id: "openrouter", name: "Jeff AI free models", configured: env => Boolean(env.OPENROUTER_API_KEY), env: ["OPENROUTER_API_KEY"] },
  { id: "google-ai-studio", name: "Google AI Studio / Gemini", configured: env => Boolean(env.GEMINI_API_KEY), env: ["GEMINI_API_KEY"] },
  { id: "anthropic", name: "Anthropic Claude", configured: env => Boolean(env.ANTHROPIC_API_KEY), env: ["ANTHROPIC_API_KEY"] },
  { id: "cloudflare", name: "Cloudflare API", configured: env => Boolean(env.CLOUDFLARE_API_TOKEN && env.CLOUDFLARE_ACCOUNT_ID), env: ["CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID"] },
  { id: "cloudflare-d1", name: "Cloudflare D1 account database", configured: env => Boolean(env.JT_AUTH_DB), env: ["JT_AUTH_DB binding"] }
];
const integrations = [
  ["github","GitHub","Repositories, issues and pull requests"],["google-drive","Google Drive","Files and documents"],["google-calendar","Google Calendar","Events and scheduling"],["gmail","Gmail","Email workflows"],["slack","Slack","Team messaging"],["discord","Discord","Community messaging"],["notion","Notion","Notes and knowledge bases"],["linear","Linear","Issues and project tracking"],["jira","Jira","Software project management"],["trello","Trello","Boards and tasks"],["dropbox","Dropbox","Cloud files"],["onedrive","OneDrive","Microsoft files"],["sharepoint","SharePoint","Team documents"],["microsoft-teams","Microsoft Teams","Team collaboration"],["figma","Figma","Design files"],["canva","Canva","Design projects"],["hubspot","HubSpot","CRM workflows"],["salesforce","Salesforce","CRM records"],["stripe","Stripe","Payment operations"],["supabase","Supabase","Database and auth services"],["vercel","Vercel","Deployments and projects"],["cloudflare","Cloudflare","DNS, Pages, Workers, D1 and account services"],["anthropic","Claude","Anthropic AI models"],["openai","OpenAI","OpenAI API models"],["google-ai-studio","Google AI Studio","Gemini models"]
];
export async function onRequestGet({env}) {
  const providers = PROVIDERS.map(p => ({id:p.id,name:p.name,configured:p.configured(env),requiredSecrets:p.env}));
  return new Response(JSON.stringify({providers,connectors:integrations.map(([id,name,description])=>({id,name,description,status:providers.some(p=>p.id===id&&p.configured)?"configured":"not_connected"}))}), {
    headers: {"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"}
  });
}
