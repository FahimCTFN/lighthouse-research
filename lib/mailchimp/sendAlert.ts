interface AlertEmailInput {
  to: string;
  acquirer: string;
  target: string;
  slug: string;
  summary: string;
}

export async function sendWatchlistAlert(input: AlertEmailInput) {
  const dealUrl = `${process.env.NEXT_PUBLIC_APP_URL}/deals/${input.slug}`;
  const unfollowUrl = `${process.env.NEXT_PUBLIC_APP_URL}/account?unfollow=${input.slug}`;
  const subject = `Update: ${input.acquirer} → ${input.target}`;

  const html = `
    <div style="font-family: -apple-system, system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #0B1426;">
      <h2 style="margin: 0 0 8px; font-size: 18px;">${input.acquirer} → ${input.target}</h2>
      <p style="margin: 0 0 16px; color: #4b5563; font-size: 14px;">A deal in your watchlist has been updated.</p>
      <div style="border-left: 3px solid #F0A500; padding: 8px 12px; margin: 16px 0; background: #fafafa;">
        ${escapeHtml(input.summary)}
      </div>
      <p><a href="${dealUrl}" style="background: #0B1426; color: #fff; padding: 10px 16px; text-decoration: none; border-radius: 4px; display: inline-block;">View deal</a></p>
      <p style="margin-top: 32px; font-size: 12px; color: #9ca3af;">
        <a href="${unfollowUrl}" style="color: #9ca3af;">Unfollow this deal</a>
      </p>
    </div>
  `;

  const text = `${input.acquirer} → ${input.target}\n\n${input.summary}\n\nView: ${dealUrl}\nUnfollow: ${unfollowUrl}`;

  const response = await fetch("https://mandrillapp.com/api/1.0/messages/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      key: process.env.MANDRILL_API_KEY,
      message: {
        subject,
        from_email: "alerts@ctfnlighthouse.com",
        from_name: "CTFN Lighthouse",
        to: [{ email: input.to, type: "to" }],
        html,
        text,
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Mandrill send failed: ${response.status} ${body}`);
  }
  return response.json();
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
