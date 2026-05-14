import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

const txt = (v: any) => String(v ?? "").replace(/'/g, "''");
const bit = (v: any) => (v ? 1 : 0);
const num = (v: any) => parseInt(v) || 0;

export async function POST(req: NextRequest) {
    const { modules = [], screens = [], reports = [] } = await req.json();
    let mCount = 0, sCount = 0, rCount = 0;

    try {
        for (const m of modules) {
            const ex = await executeQuery(`SELECT COUNT(*) cnt FROM modulo WHERE unico='${txt(m.unico)}'`, true);
            if (ex.recordset[0].cnt > 0) {
                await executeQuery(`UPDATE modulo SET nombre='${txt(m.nombre)}',clase='${txt(m.clase)}',
                    orden=${num(m.orden)},image='${txt(m.image)}',descripcion='${txt(m.descripcion)}',
                    active=${bit(m.active)},web=${bit(m.web)} WHERE unico='${txt(m.unico)}'`, true);
            } else {
                await executeQuery(`INSERT INTO modulo (unico,nombre,clase,orden,image,descripcion,active,web,timestamp)
                    VALUES('${txt(m.unico)}','${txt(m.nombre)}','${txt(m.clase)}',${num(m.orden)},
                    '${txt(m.image)}','${txt(m.descripcion)}',${bit(m.active)},${bit(m.web)},GETDATE())`, true);
            }
            mCount++;
        }

        for (const s of screens) {
            const ex = await executeQuery(`SELECT COUNT(*) cnt FROM pantalla WHERE unico='${txt(s.unico)}'`, true);
            if (ex.recordset[0].cnt > 0) {
                await executeQuery(`UPDATE pantalla SET run_pantalla='${txt(s.run_pantalla)}',image='${txt(s.image)}',
                    path='${txt(s.path)}',menu=${bit(s.menu)},executable='${txt(s.executable)}',
                    web_form='${txt(s.web_form)}' WHERE unico='${txt(s.unico)}'`, true);
            } else {
                await executeQuery(`INSERT INTO pantalla (unico,modulo_uq,nombre,orden,run_pantalla,image,path,menu,executable,web_form,descripcion,timestamp)
                    VALUES('${txt(s.unico)}','${txt(s.modulo_uq)}','${txt(s.nombre)}',${num(s.orden)},
                    '${txt(s.run_pantalla)}','${txt(s.image)}','${txt(s.path)}',${bit(s.menu)},
                    '${txt(s.executable)}','${txt(s.web_form)}','${txt(s.descripcion)}',GETDATE())`, true);
            }
            sCount++;
        }

        for (const r of reports) {
            const ex = await executeQuery(`SELECT COUNT(*) cnt FROM pantalla_reportes WHERE unico='${txt(r.unico)}'`, true);
            if (ex.recordset[0].cnt > 0) {
                await executeQuery(`UPDATE pantalla_reportes SET nombre='${txt(r.nombre)}',titulo='${txt(r.titulo)}',
                    path='${txt(r.path)}',fecha_desde=${bit(r.fecha_desde)},fecha_hasta=${bit(r.fecha_hasta)},
                    numero_desde=${bit(r.numero_desde)},numero_hasta=${bit(r.numero_hasta)},actual=${bit(r.actual)},
                    comprimido=${bit(r.comprimido)},detallado=${bit(r.detallado)},exportar=${bit(r.exportar)}
                    WHERE unico='${txt(r.unico)}'`, true);
            } else {
                await executeQuery(`INSERT INTO pantalla_reportes (unico,panta_uq,nombre,titulo,path,descripcion,
                    fecha_desde,fecha_hasta,numero_desde,numero_hasta,actual,comprimido,detallado,exportar,timestamp)
                    VALUES('${txt(r.unico)}','${txt(r.panta_uq)}','${txt(r.nombre)}','${txt(r.titulo)}',
                    '${txt(r.path)}','${txt(r.descripcion)}',${bit(r.fecha_desde)},${bit(r.fecha_hasta)},
                    ${bit(r.numero_desde)},${bit(r.numero_hasta)},${bit(r.actual)},${bit(r.comprimido)},
                    ${bit(r.detallado)},${bit(r.exportar)},GETDATE())`, true);
            }
            rCount++;
        }

        return NextResponse.json({ success: true, imported: { modules: mCount, screens: sCount, reports: rCount } });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
