import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { QuoteState } from '@/lib/types';
import { getFinalEmailHtml, getStepEmailHtml } from '@/lib/email-templates';
import { renderToStream } from '@react-pdf/renderer';
import { QuotePdf } from '@/lib/pdf/QuotePdf';
import React from 'react';

export async function POST(req: NextRequest) {
    try {
        const state = await req.json() as QuoteState;
        const action = req.headers.get('x-action');
        const isDownload = action === 'download-pdf';
        const isNotifyStep = action === 'notify-step';

        // Generate PDF Stream (Only if needed)
        let pdfBuffer: Buffer | null = null;

        if (!isNotifyStep) {
            const path = require('path');
            const logoPath = path.join(process.cwd(), 'public', 'brand-logo.png');
            // @ts-ignore
            const pdfStream = await renderToStream(<QuotePdf data={state} logoPath={logoPath} />);
            const chunks: any[] = [];
            for await (const chunk of pdfStream) {
                chunks.push(chunk);
            }
            pdfBuffer = Buffer.concat(chunks);
        }

        // If direct download requested, return PDF
        if (isDownload && pdfBuffer) {
            return new NextResponse(pdfBuffer as any, {
                status: 200,
                headers: {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `attachment; filename="Devis_Celeste_${state.id.slice(0, 6)}.pdf"`,
                },
            });
        }

        // Email Sending Logic (Only if config exists)
        if (!process.env.MANAGER_EMAIL || !process.env.FROM_EMAIL || !process.env.RESEND_API_KEY) {
            // For notification step, specific error or ignore? 
            if (isNotifyStep) return NextResponse.json({ success: true, warning: "Email config missing" }); // Don't block flow
            return NextResponse.json({ error: "Email configuration missing" }, { status: 500 });
        }

        const resend = new Resend(process.env.RESEND_API_KEY);
        let subject = `✅ Simulation Terminée - ${state.client.firstName} ${state.client.lastName}`;
        let html = getFinalEmailHtml(state);
        let attachments: any[] = [];

        if (isNotifyStep) {
            html = getStepEmailHtml(state);
            subject = `🚀 Nouveau Prospect (Étape ${state.step}) - ${state.client.firstName} ${state.client.lastName}`;
        } else if (action === 'send-question') {
            // New Question Action
            // Body already parsed into 'state' above.
            // Safest: Body is { ...state, question: "..." } or handle raw body.
            // Let's rely on the frontend sending { ...state, userQuestion: "..." }
            const question = (state as any).userQuestion || "Pas de question spécifiée.";
            subject = `❓ Nouvelle Question - ${state.client.firstName} ${state.client.lastName}`;
            html = `
                <h1>Nouvelle question d'un prospect</h1>
                <p><strong>Client:</strong> ${state.client.firstName} ${state.client.lastName} (${state.client.email})</p>
                <p><strong>Téléphone:</strong> ${state.client.phone}</p>
                <hr />
                <p><strong>Question:</strong></p>
                <p style="background-color: #f3f4f6; padding: 15px; border-left: 4px solid #059669; font-style: italic;">
                    ${question.replace(/\n/g, '<br/>')}
                </p>
                <hr />
                <p><a href="mailto:${state.client.email}">Répondre au client</a></p>
            `;
        } else if (pdfBuffer) {
            attachments = [
                {
                    filename: `Devis_Celeste_${state.id.slice(0, 6)}.pdf`,
                    content: pdfBuffer,
                }
            ];
        }

        // Send Email
        const { data, error } = await resend.emails.send({
            from: process.env.FROM_EMAIL,
            to: process.env.MANAGER_EMAIL,
            subject: subject,
            html: html,
            attachments: attachments
        });

        if (error) {
            console.error("Resend error:", error);
            // Even if email fails, if appropriate, we could return success or the PDF?
            // But client expects JSON.
            return NextResponse.json({ error }, { status: 400 });
        }

        return NextResponse.json({ success: true, data });
    } catch (e: any) {
        console.error("Finalize Error:", e);
        return NextResponse.json({ error: e.message || "Internal Error" }, { status: 500 });
    }
}
