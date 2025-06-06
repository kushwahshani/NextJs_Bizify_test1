// import { getRequestContext } from "@cloudflare/next-on-pages";
// import { NextResponse } from "next/server";

// export async function POST(request) {


//     // let d1 = env.DB;


//     const data = await request.json();
//     console.log(data);
//     return NextResponse.json({
//         data
//     })

//     // console.log("post data successfully");
// }

// d1 database connect and add the data

import { getRequestContext } from '@cloudflare/next-on-pages';
export const runtime = 'edge';

// export const config = { runtime: "edge" };
export async function POST(req) {
    try {
        const { env } = getRequestContext();
        const myDb = env.DB;
        const data = await req.json();
        console.log("post data", data);
        
        const { name, email, message } = data;
        await myDb.prepare(
            "INSERT INTO customer (name, email, message) VALUES (?, ?, ?)"
        )
            .bind(name, email, message)
            .run();
        return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error processing form submission:", error);
        return new Response(JSON.stringify({ error: "Failed to process form" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}

export async function GET() {
    try {
        const { env } = getRequestContext();
        const myDb = env.DB;

        let result = await myDb.prepare("SELECT * FROM customer").all();

        return new Response(JSON.stringify(result), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error fetching data:", error);
        return new Response(JSON.stringify({ error: "Failed to fetch data" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}


export async function DELETE(req) {
    try {
        const { env } = getRequestContext();
        const myDb = env.DB;
        const { email } = await req.json();

        const result = await myDb
            .prepare("DELETE FROM customer WHERE email = ?")
            .bind(email)
            .run(); // ✅ Use run instead of all

        return new Response(JSON.stringify({ success: true, result }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("DELETE error:", error);
        return new Response(JSON.stringify({ error: "Failed to delete data" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

export async function PUT(req) {
    try {
        const { env }  = getRequestContext();
        const myDb = env.DB;

        const data = await req.json();
        const {name, message, email} = data

        const result = await myDb.prepare("UPDATE customer SET name = ?, message = ? WHERE email = ?")
            .bind(name, message, email)
            .run();

        return new Response(JSON.stringify({success:true}),{
            headers:{"Content-type":"application/json"}
        })
    } catch (error) {
        console.error("Update error:", error);
        return new Response(JSON.stringify({ error: "Failed to update data" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}