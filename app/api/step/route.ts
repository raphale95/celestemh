import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { QuoteState } from '@/lib/types';
import { getStepEmailHtml } from '@/lib/email-templates';



export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { quoteId, stepNumber, payload } = body;
        // We expect the full state in payload usually, or we merge it. 
        // For simplicity, let's assume 'payload' IS the state or contains enough info.
        // In our context, we send the full 'state' object.
        const state = body as QuoteState;

        if (!process.env.MANAGER_EMAIL || !process.env.FROM_EMAIL || !process.env.RESEND_API_KEY) {
            console.error("Missing email env vars");
            return NextResponse.json({ error: "Server config error" }, { status: 500 });
        }

        const resend = new Resend(process.env.RESEND_API_KEY);

        // Simple throttling could be done here (e.g. check KV store), skipped for prototype.

        const { data, error } = await resend.emails.send({
            from: process.env.FROM_EMAIL,
            to: process.env.MANAGER_EMAIL,
            subject: `[Step ${state.step}] Simulation Devis - ${state.client.lastName}`,
            html: getStepEmailHtml(state),
        });

        if (error) {
            console.error("Resend error:", error);
            return NextResponse.json({ error }, { status: 400 });
        }

        return NextResponse.json({ success: true, data });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
