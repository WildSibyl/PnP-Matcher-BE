import jwt from "jsonwebtoken";
import ErrorResponse from "../utils/ErrorResponse.js";

const verifyToken = (req, res, next) => {
  //console.log(req.headers.cookie); //without this line, the cookie will not be parsed
  const { token } = req.cookies; // cookie-parser will parse the cookies and add them to the req.cookies object

  console.log(token);

  if (!token) throw new ErrorResponse("Unauthorized", 401);

  const payload = jwt.verify(token, process.env.JWT_SECRET);

  //console.log(payload);

  req.userId = payload.id; // add the user id to the request object so we can use it in the next middleware or route handler
  req.userPermission = payload.permission; // add the user permission to the request object

  next();
};

export default verifyToken;

// multiple cookies will be stored in the request headers as a single string, separated by semicolons
// so we need to split the string and parse it into an object
// npm i cookie-parser
