export const DELETE = async (request) => {
  const rawAuthHeader = headers().get("authorization");
  const token = rawAuthHeader.split(" ")[1];
  let studentId = null;
  //preparing "role" variable for reading role information from token
  let role = null;

  try {
    const payload = Jwt.verify(token, process.env.JWT_SECRET);
    studentId = payload.studentId;
    //read role information from "payload" here (just one line code!)
    //role = ...
    role = payload.role;
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid token",
      },
      { status: 401 }
    );
  }

  //if role is "ADMIN", send the following response
  if (role === "ADMIN") {
    return NextResponse.json(
      {
        ok: true,
        message: "Only Student can access this API route",
      },
      { status: 403 }
    );
  }
  //get courseNo from body and validate it
  const body = await request.json();
  const { courseNo } = body;
  if (typeof courseNo !== "string" || courseNo.length !== 6) {
    return NextResponse.json(
      {
        ok: false,
        message: "courseNo must contain 6 characters",
      },
      { status: 400 }
    );
  }

  const foundIndex = DB.enrollments.findIndex(
    (x) => x.studentId === studentId && x.courseNo === courseNo
  );
  if (foundIndex === -1) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "You cannot drop from this course. You have not enrolled it yet!",
      },
      { status: 404 }
    );
  }

  DB.enrollments.splice(foundIndex, 1);

  return NextResponse.json({
    ok: true,
    message: "You has dropped from this course. See you next semester.",
  });
};
