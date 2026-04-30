import { NextResponse } from "next/server";

export async function GET() {
  const resources = [
    { id: 1, title: "Physics Lab Manual", subject: "Physics", class: "XII", type: "manual", uploaded_by: "Dr. Sharma", file: "physics_lab_manual.txt" },
    { id: 2, title: "Organic Chemistry Notes", subject: "Chemistry", class: "XI", type: "notes", uploaded_by: "Mr. Verma", file: "organic_chemistry_notes.txt" },
    { id: 3, title: "Computer Science Textbook", subject: "Computer Science", class: "X", type: "textbook", uploaded_by: "Ms. Gupta", file: "computer_science_textbook.txt" },
    { id: 4, title: "Mathematics Formulas", subject: "Mathematics", class: "General", type: "document", uploaded_by: "Mr. Singh", file: "mathematics_formulas.txt" },
    { id: 5, title: "English Literature Guide", subject: "English", class: "General", type: "document", uploaded_by: "Ms. Davis", file: "english_literature_guide.txt" },
    { id: 6, title: "History Timeline", subject: "History", class: "X", type: "notes", uploaded_by: "Mr. Patel", file: "history_timeline.txt" },
  ];

  return NextResponse.json({ resources });
}
