import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { QuoteState } from '@/lib/types';
import { getFinalEmailHtml } from '@/lib/email-templates';
import { renderToStream } from '@react-pdf/renderer';
import { QuotePdf } from '@/lib/pdf/QuotePdf';
import React from 'react';

export async function POST(req: NextRequest) {
    try {
        const state = await req.json() as QuoteState;
        const isDownload = req.headers.get('x-action') === 'download-pdf';

        // Generate PDF Stream
        const path = require('path');
        const logoPath = path.join(process.cwd(), 'public', 'brand-logo.png');
        const pdfStream = await renderToStream(<QuotePdf data={state} logoPath={logoPath} />);

        // Convert stream to Buffer
        const chunks: any[] = [];
        for await (const chunk of pdfStream) {
            chunks.push(chunk);
        }
        const pdfBuffer = Buffer.concat(chunks);

        // If direct download requested, return PDF
        if (isDownload) {
            return new NextResponse(pdfBuffer, {
                status: 200,
                headers: {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `attachment; filename="Devis_Celeste_${state.id.slice(0, 6)}.pdf"`,
                },
            });
        }

        // Email Sending Logic (Only if config exists)
        if (!process.env.MANAGER_EMAIL || !process.env.FROM_EMAIL || !process.env.RESEND_API_KEY) {
            // If config missing but NOT download request, return error or maybe just PDF? 
            // Requirement: "simulateur devis" -> likely wants result. 
            // Fallback: Return PDF if email fails? 
            // For now, return error to prompt setup, but DOWNLOAD button handles the user need.
            return NextResponse.json({ error: "Email configuration missing" }, { status: 500 });
        }

        const resend = new Resend(process.env.RESEND_API_KEY);

        // Send Email with Attachment
        const { data, error } = await resend.emails.send({
            from: process.env.FROM_EMAIL,
            to: process.env.MANAGER_EMAIL,
            subject: `✅ Simulation Terminée - ${state.client.firstName} ${state.client.lastName}`,
            html: getFinalEmailHtml(state),
            attachments: [
                {
                    filename: `Devis_Celeste_${state.id.slice(0, 6)}.pdf`,
                    content: pdfBuffer,
                }
            ]
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
