// DRAFT TEMPLATES. Replace [bracketed] items and have a Kenyan lawyer review before launch.
const co='[Registered company name]',addr='[Registered address, Mombasa, Kenya]',mail='info@esportsafrica.org'
export const LEGAL={
terms:{title:'Terms of Service',body:[
['1. Who we are',`These terms govern your use of esportsafrica.org and our tournaments, run by ${co} ("Esports Africa", "we"), ${addr}.`],
['2. Accounts',`You must provide accurate information and keep your login secure. You must be 16 or older to hold an account; players under 18 need a parent or guardian's consent to enter any tournament.`],
['3. Tournament entry',`Entry is confirmed only when your registration is approved and the entry fee (if any) is paid within 72 hours of approval, after which your slot may be released. Organisers may reject entries, and their rulings on matches and conduct are final. Cheating, abuse or match-fixing leads to disqualification without refund.`],
['4. Tickets',`Each ticket admits one person to the stated event and is valid once. Tickets are not transferable for resale. We may refuse entry for safety reasons. If an event is cancelled we refund the ticket price.`],
['5. Prizes',`Prize amounts are as published for each tournament and paid to the winning entrant after verification of identity and eligibility. Taxes on winnings are the winner's responsibility.`],
['6. Payments',`Payments are processed by Paystack in Kenyan shillings (KES). We do not store card details.`],
['7. Liability',`To the extent allowed by law we are not liable for indirect losses. Nothing limits liability that cannot be limited by law.`],
['8. Governing law',`These terms are governed by the laws of Kenya. Contact: ${mail}.`]]},
privacy:{title:'Privacy Policy',body:[
['Who is responsible',`${co}, ${addr}, is the data controller. Contact: ${mail}.`],
['What we collect',`Account details (name, email, phone, country, gamertag, Discord), registration details (including date of birth, and guardian details for under-18s), team logos you upload, orders and tickets, and basic technical data needed to run the site.`],
['Why',`To run tournaments, verify eligibility and age, take payments, issue tickets, email you about your entries and events, and keep the site secure.`],
['Who we share it with',`Service providers that process data for us: Supabase (database and login), Paystack (payments), Resend (email), Vercel (hosting and privacy-friendly analytics). We do not sell personal data.`],
['Minors',`We collect a guardian's name and phone for players under 18 solely to confirm consent and for safety.`],
['Your rights',`You can download your data and delete your account from your account page, or email ${mail} to access, correct or object. You may also complain to the Office of the Data Protection Commissioner of Kenya.`],
['Retention',`Account and registration data are kept while your account exists. Payment records are kept for accounting and tax purposes with personal details removed when an account is deleted.`]]},
refunds:{title:'Refund Policy',body:[
['Tickets',`Tickets are refundable up to [7] days before the event; after that they are non-refundable unless the event is cancelled or rescheduled and you cannot attend.`],
['Entry fees',`Entry fees are refundable until the registration deadline. After the deadline they are refunded only if we cancel the tournament or reject a paid entry.`],
['How refunds work',`Refunds go back to the original payment method (card or M-Pesa) and can take several business days. Email ${mail} with your order reference.`]]},
cookies:{title:'Cookie Policy',body:[
['What we use',`Essential cookies only: they keep you signed in and protect forms. Our analytics are privacy-friendly and do not use advertising cookies.`],
['Third parties',`If enabled, Cloudflare Turnstile (bot protection) and Paystack's checkout may set their own security cookies on their pages.`],
['Control',`You can clear or block cookies in your browser; signing in will not work without essential cookies.`]]}}
