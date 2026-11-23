import RulesAccordion from '@/components/RulesAccordion'
export const metadata={title:'FAQ · Esports Africa'}
const FAQ=[{title:'How do I register for a tournament?',body:'Create an account, open the tournament page and press Register. Once the organisers approve your entry you pay the entry fee from your account.'},
{title:'How long do I have to pay after approval?',body:'72 hours. After that the slot is released to other players.'},
{title:'Which payment methods do you accept?',body:'Cards and M-Pesa, processed securely by Paystack in Kenyan shillings.'},
{title:'Where are my tickets?',body:'In your account under My tickets, as a QR code, as soon as payment is confirmed. Show the QR code at the gate.'},
{title:'Can I get a refund?',body:'See the refund policy. In short: refundable before the deadline, or if we cancel.'},
{title:'I’m under 18. Can I play?',body:'Yes, with a parent or guardian’s consent, which you provide when registering.'},
{title:'I forgot my password.',body:'Use “Forgot password?” on the sign-in page and follow the emailed link.'}]
export default function Faq(){return <div className="wrap max-w-3xl py-12"><h1 className="mb-6 text-[clamp(44px,8vw,88px)] font-extrabold">FAQ</h1><RulesAccordion rules={FAQ}/></div>}
