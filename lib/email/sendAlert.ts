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
  const subject = `Update: ${input.target} / ${input.acquirer}`;

  const html = `
    <div style="font-family: -apple-system, system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #0c2d48;">
      <div style="margin-bottom: 20px;">
        <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280;">Lighthouse by CTFN</span>
      </div>
      <h2 style="margin: 0 0 8px; font-size: 18px; font-weight: 600;">${escapeHtml(input.target)} / ${escapeHtml(input.acquirer)}</h2>
      <p style="margin: 0 0 16px; color: #4b5563; font-size: 14px;">A deal in your watchlist has been updated.</p>
      <div style="border-left: 3px solid #d4860a; padding: 12px 16px; margin: 20px 0; background: #fdf0d5; border-radius: 0 4px 4px 0;">
        <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #7a4a00;">${escapeHtml(input.summary)}</p>
      </div>
      <a href="${dealUrl}" style="display: inline-block; background: #0c2d48; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-size: 14px; font-weight: 500;">View deal</a>
      <div style="margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 12px; color: #9ca3af; margin: 0;">
          You're receiving this because you follow this deal on Lighthouse.
          <a href="${unfollowUrl}" style="color: #9ca3af; text-decoration: underline;">Unfollow</a>
        </p>
      </div>
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "Lighthouse by CTFN <alerts@ctfnlighthouse.com>",
      to: [input.to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend send failed: ${response.status} ${body}`);
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
