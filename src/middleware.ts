export { default } from "next-auth/middleware";

// /responder también exige sesión: estudiante y docente inician sesión
// con el mismo mecanismo (HU-0103) — la verificación de "pertenece al
// grupo objetivo" (HU-0201) se hace aparte, dentro de la página.
export const config = {
  matcher: ["/encuestas/:path*", "/responder/:path*", "/admin/:path*", "/configuracion/:path*"],
};
