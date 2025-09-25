import { NextResponse, NextRequest } from "next/server"
import { cookies } from "next/headers"
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

// コメントを取得するAPI
export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json({ error: "Date is required" }, { status: 400 });
  }

  try {
    const { data, error } = await supabase.from("classroom_comments").select("*").eq("date", date);
    if (error) {
      throw error;
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching classroom comments:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch classroom comments",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// コメントを保存するAPI
export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  try {
    const body = await request.json();
    const { date, time_slot, class_group, classroom, comment } = body;

    if (!date || !time_slot || !class_group || !classroom) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 既存のコメントを確認
    const { data: existingComment, error: fetchError } = await supabase
      .from("classroom_comments")
      .select("id")
      .eq("date", date)
      .eq("time_slot", time_slot)
      .eq("class_group", class_group)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116はデータが見つからない場合のエラーコード
      throw fetchError;
    }

    let result;
    if (existingComment) {
      // 既存のコメントを更新
      result = await supabase
        .from("classroom_comments")
        .update({ comment, classroom, updated_at: new Date().toISOString() })
        .eq("id", existingComment.id);
    } else {
      // 新しいコメントを作成
      result = await supabase.from("classroom_comments").insert([
        {
          date,
          time_slot,
          class_group,
          classroom,
          comment,
        },
      ]);
    }

    if (result.error) {
      throw result.error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving classroom comment:", error);
    return NextResponse.json(
      { error: "Failed to save classroom comment", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

// コメントを削除するAPI
export async function DELETE(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const time_slot = searchParams.get("time_slot");
  const class_group = searchParams.get("class_group");

  if (!date || !time_slot || !class_group) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  try {
    const { error } = await supabase
      .from("classroom_comments")
      .delete()
      .eq("date", date)
      .eq("time_slot", time_slot)
      .eq("class_group", class_group);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting classroom comment:", error);
    return NextResponse.json(
      {
        error: "Failed to delete classroom comment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
