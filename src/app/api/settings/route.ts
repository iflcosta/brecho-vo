/**
 * @spec docs/SPEC-SDD.md#4.4-get-put-apisettings
 * @description CRUD das configurações da loja (single-row)
 * @author Mavis
 *
 * Status: ESQUELETO (Tela de Settings — fora do MVP, mas infra pronta)
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

async function getOrCreateSettings() {
  let settings = await prisma.settings.findFirst();
  if (!settings) {
    settings = await prisma.settings.create({ data: {} });
  }
  return settings;
}

export async function GET() {
  try {
    const settings = await getOrCreateSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("[api/settings] GET erro:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao buscar configurações" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const current = await getOrCreateSettings();

    const updated = await prisma.settings.update({
      where: { id: current.id },
      data: {
        storeName: body.storeName ?? current.storeName,
        instagramHandle: body.instagramHandle ?? current.instagramHandle,
        logoUrl: body.logoUrl ?? current.logoUrl,
        primaryColor: body.primaryColor ?? current.primaryColor,
        secondaryColor: body.secondaryColor ?? current.secondaryColor,
        fontFamily: body.fontFamily ?? current.fontFamily,
        defaultHashtags: body.defaultHashtags ?? current.defaultHashtags,
        contactInfo: body.contactInfo ?? current.contactInfo,
        paymentInfo: body.paymentInfo ?? current.paymentInfo,
        shippingInfo: body.shippingInfo ?? current.shippingInfo,
      },
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    console.error("[api/settings] PUT erro:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao atualizar configurações" },
      { status: 500 }
    );
  }
}
