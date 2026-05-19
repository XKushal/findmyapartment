"use client";

import SwaggerUI from "swagger-ui-react";

export function SwaggerDocs() {
  return <SwaggerUI url="/api/openapi.json" docExpansion="list" />;
}
