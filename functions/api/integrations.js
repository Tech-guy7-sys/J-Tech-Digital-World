const AI_PROVIDERS = [
  { id: "openrouter", name: "OpenRouter free models", costClass: "free-tier", secrets: ["OPENROUTER_API_KEY"] },
  { id: "google-ai-studio", name: "Google Gemini free tier", costClass: "free-tier-project-required", secrets: ["GEMINI_API_KEY", "GEMINI_FREE_TIER_CONFIRMED"] },
  { id: "groq", name: "Groq free tier", costClass: "free-tier", secrets: ["GROQ_API_KEY", "GROQ_FREE_TIER_CONFIRMED"] },
  { id: "cloudflare-workers-ai", name: "Cloudflare Workers AI free allocation", costClass: "free-tier-plan-required", secrets: ["CLOUDFLARE_WORKERS_PLAN", "CLOUDFLARE_AI_FREE_TIER_CONFIRMED"], binding: "AI", capabilities: ["image-generation"] }
];
const CONNECTORS = [
  ["github","GitHub","Developer tools","Link your GitHub identity. Repository access will use a separate read-only GitHub App installation.","read","GitHub OAuth app for identity; GitHub App with read-only repository permissions for project access"],
  ["google-drive","Google Drive","Google","Search and read files the user authorises","read","Google Cloud OAuth client + consent screen"],
  ["gmail","Gmail","Google","Search messages and prepare drafts; sending requires separate approval","read","Google Cloud OAuth client + Gmail scopes"],
  ["google-calendar","Google Calendar","Google","Search upcoming events on calendars the user authorises","read","Google Cloud OAuth client + Calendar API + calendar.events.readonly scope"],
  ["notion","Notion","Knowledge","Search pages and databases shared with the JT integration","read","Notion public OAuth integration"],
  ["slack","Slack","Messaging","Search messages in workspaces you authorise","read","Slack app with user-scope search:read and users:read"],
  ["dropbox","Dropbox","Cloud storage","Search files in your authorised Dropbox account","read","Dropbox OAuth app with files.metadata.read"],
  ["onedrive","OneDrive","Microsoft","Search files in your authorised OneDrive account","read","Microsoft Entra app with delegated User.Read and Files.Read permissions"],
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
  ["cloudflare","Cloudflare","Developer tools","Inspect Pages, Workers, DNS and D1 resources","read-write","Cloudflare scoped API token"]
];
export async function onRequestGet({env}) {
  const providers = AI_PROVIDERS.map(p => ({
    id:p.id,name:p.name,costClass:p.costClass,
    configured:p.secrets.every(k=>Boolean(env?.[k])) && (!p.binding || typeof env?.[p.binding]?.run === "function"),
    requiredSecrets:p.secrets,
    capabilities:p.capabilities || []
  }));
  const connectors = CONNECTORS.map(([id,name,category,description,access,setup]) => ({
    id,name,category,description,access,
    status: id==="github" && Boolean(env?.GITHUB_CLIENT_ID && env?.GITHUB_CLIENT_SECRET) ? "oauth_configured" : ["google-drive","gmail","google-calendar"].includes(id) && Boolean(env?.GOOGLE_CLIENT_ID && env?.GOOGLE_CLIENT_SECRET) ? "oauth_configured" : ["notion","slack","dropbox","onedrive"].includes(id) && Boolean(id==="notion" ? env?.NOTION_CLIENT_ID && env?.NOTION_CLIENT_SECRET : id==="slack" ? env?.SLACK_CLIENT_ID && env?.SLACK_CLIENT_SECRET : id==="dropbox" ? env?.DROPBOX_CLIENT_ID && env?.DROPBOX_CLIENT_SECRET : env?.MICROSOFT_CLIENT_ID && env?.MICROSOFT_CLIENT_SECRET) ? "oauth_configured" : id==="cloudflare" && Boolean(env?.CLOUDFLARE_API_TOKEN && env?.CLOUDFLARE_ACCOUNT_ID) ? "credentials_configured" : "setup_required",
    oauthSupported: id==="github" || ["google-drive","gmail","google-calendar","notion","slack","dropbox","onedrive"].includes(id),
    oauthConfigured: id==="github" ? Boolean(env?.GITHUB_CLIENT_ID && env?.GITHUB_CLIENT_SECRET) : ["google-drive","gmail","google-calendar"].includes(id) ? Boolean(env?.GOOGLE_CLIENT_ID && env?.GOOGLE_CLIENT_SECRET) : id==="notion" ? Boolean(env?.NOTION_CLIENT_ID && env?.NOTION_CLIENT_SECRET) : id==="slack" ? Boolean(env?.SLACK_CLIENT_ID && env?.SLACK_CLIENT_SECRET) : id==="dropbox" ? Boolean(env?.DROPBOX_CLIENT_ID && env?.DROPBOX_CLIENT_SECRET) : id==="onedrive" ? Boolean(env?.MICROSOFT_CLIENT_ID && env?.MICROSOFT_CLIENT_SECRET) : false,
    setup,
    available:Boolean((id==="github" || ["google-drive","gmail","google-calendar","notion","slack","dropbox","onedrive"].includes(id)) && (id==="github" ? env?.GITHUB_CLIENT_ID && env?.GITHUB_CLIENT_SECRET : ["google-drive","gmail","google-calendar"].includes(id) ? env?.GOOGLE_CLIENT_ID && env?.GOOGLE_CLIENT_SECRET : id==="notion" ? env?.NOTION_CLIENT_ID && env?.NOTION_CLIENT_SECRET : id==="slack" ? env?.SLACK_CLIENT_ID && env?.SLACK_CLIENT_SECRET : id==="dropbox" ? env?.DROPBOX_CLIENT_ID && env?.DROPBOX_CLIENT_SECRET : env?.MICROSOFT_CLIENT_ID && env?.MICROSOFT_CLIENT_SECRET) && env?.JT_AUTH_DB && env?.JT_CONNECTOR_ENCRYPTION_KEY)
  }));
  return new Response(JSON.stringify({
    product:"Jeff AI Connectors Hub",
    version:2,
    architecture:"server-side OAuth/API adapters with least-privilege scopes",
    costPolicy:"free-tier-only",
    paidAiProvidersEnabled:false,
    providers,
    connectors,
    accountStorageConfigured:Boolean(env?.JT_AUTH_DB),
    connectorStorageConfigured:Boolean(env?.JT_AUTH_DB),
    credentialPresence:{
      googleClientId:Boolean(typeof env?.GOOGLE_CLIENT_ID==="string"&&env.GOOGLE_CLIENT_ID.trim()),
      googleClientSecret:Boolean(typeof env?.GOOGLE_CLIENT_SECRET==="string"&&env.GOOGLE_CLIENT_SECRET.trim()),
      githubClientId:Boolean(typeof env?.GITHUB_CLIENT_ID==="string"&&env.GITHUB_CLIENT_ID.trim()),
      githubClientSecret:Boolean(typeof env?.GITHUB_CLIENT_SECRET==="string"&&env.GITHUB_CLIENT_SECRET.trim()),
      connectorEncryptionKey:Boolean(typeof env?.JT_CONNECTOR_ENCRYPTION_KEY==="string"&&env.JT_CONNECTOR_ENCRYPTION_KEY.trim()),
    notionClientId:Boolean(typeof env?.NOTION_CLIENT_ID==="string"&&env.NOTION_CLIENT_ID.trim()),notionClientSecret:Boolean(typeof env?.NOTION_CLIENT_SECRET==="string"&&env.NOTION_CLIENT_SECRET.trim()),
    slackClientId:Boolean(typeof env?.SLACK_CLIENT_ID==="string"&&env.SLACK_CLIENT_ID.trim()),slackClientSecret:Boolean(typeof env?.SLACK_CLIENT_SECRET==="string"&&env.SLACK_CLIENT_SECRET.trim()),
    dropboxClientId:Boolean(typeof env?.DROPBOX_CLIENT_ID==="string"&&env.DROPBOX_CLIENT_ID.trim()),dropboxClientSecret:Boolean(typeof env?.DROPBOX_CLIENT_SECRET==="string"&&env.DROPBOX_CLIENT_SECRET.trim()),
    microsoftClientId:Boolean(typeof env?.MICROSOFT_CLIENT_ID==="string"&&env.MICROSOFT_CLIENT_ID.trim()),microsoftClientSecret:Boolean(typeof env?.MICROSOFT_CLIENT_SECRET==="string"&&env.MICROSOFT_CLIENT_SECRET.trim()),
      connectorDatabaseBinding:Boolean(Boolean(env?.JT_AUTH_DB))
    }
  }), {headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"}});
}
