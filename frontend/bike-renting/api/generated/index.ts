import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

const CompleteRentalRequest = z
  .object({ end_station: z.number().int() })
  .passthrough();
const pageable = z
  .object({
    page: z.number().int().gte(0),
    size: z.number().int().gte(1),
    sort: z.array(z.string()),
  })
  .partial()
  .passthrough();
const CreateTechnicianRequest = z
  .object({
    name: z.string().min(0).max(100),
    phone: z.string().min(0).max(20),
    specialization: z.string().min(0).max(100),
  })
  .passthrough();
const CoordinatesDto = z
  .object({
    latitude: z.number().gte(-90).lte(90),
    longitude: z.number().gte(-180).lte(180),
  })
  .passthrough();
const CreateStationRequest = z
  .object({ name: z.string().min(0).max(100), coordinates: CoordinatesDto })
  .passthrough();
const CreateRepairRequest = z
  .object({
    bicycleId: z.number().int(),
    technicianId: z.number().int(),
    description: z.string().min(0).max(500),
  })
  .passthrough();
const CreateRentalRequest = z
  .object({
    user: z.number().int(),
    bicycle: z.number().int(),
    start_station: z.number().int(),
  })
  .passthrough();
const CreatePaymentRequest = z
  .object({ amount: z.number().int().gte(1).lte(999999) })
  .passthrough();
const CreateBicycleRequest = z
  .object({
    model: z.string().min(0).max(100),
    type: z.string(),
    status: z.string().optional(),
    stationId: z.number().int(),
  })
  .passthrough();
const RegisterRequest = z
  .object({
    username: z
      .string()
      .min(3)
      .max(50)
      .regex(/^[a-zA-Z0-9_]+$/),
    password: z
      .string()
      .min(8)
      .max(100)
      .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/),
  })
  .passthrough();
const RefreshTokenRequest = z
  .object({ refresh_token: z.string() })
  .passthrough();
const LoginRequest = z
  .object({ username: z.string(), password: z.string() })
  .passthrough();
const AdminRegisterRequestRequest = z
  .object({ username: z.string(), description: z.string().min(0).max(500) })
  .passthrough();

export const schemas = {
  CompleteRentalRequest,
  pageable,
  CreateTechnicianRequest,
  CoordinatesDto,
  CreateStationRequest,
  CreateRepairRequest,
  CreateRentalRequest,
  CreatePaymentRequest,
  CreateBicycleRequest,
  RegisterRequest,
  RefreshTokenRequest,
  LoginRequest,
  AdminRegisterRequestRequest,
};

const endpoints = makeApi([
  {
    method: "post",
    path: "/api/v1/admin-requests/create",
    alias: "createAdminRequest",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: AdminRegisterRequestRequest,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 409,
        description: `Request already pending for this user`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/api/v1/admin-requests/pending",
    alias: "getPendingRequests",
    requestFormat: "json",
    parameters: [
      {
        name: "pageable",
        type: "Query",
        schema: pageable,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "patch",
    path: "/api/v1/admin-requests/pending/:requestId/approve",
    alias: "approveRequest",
    requestFormat: "json",
    parameters: [
      {
        name: "requestId",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Request not found`,
        schema: z.void(),
      },
      {
        status: 409,
        description: `Request already processed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "patch",
    path: "/api/v1/admin-requests/pending/:requestId/reject",
    alias: "rejectRequest",
    requestFormat: "json",
    parameters: [
      {
        name: "requestId",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Request not found`,
        schema: z.void(),
      },
      {
        status: 409,
        description: `Request already processed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/api/v1/admin-requests/pending/user/:userId",
    alias: "getRequestByUserId",
    requestFormat: "json",
    parameters: [
      {
        name: "userId",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/v1/admin-requests/role",
    alias: "getCurrentUserRoles",
    requestFormat: "json",
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/v1/auth/info",
    alias: "info",
    description: `Returns information about the currently authenticated user`,
    requestFormat: "json",
    response: z.void(),
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/api/v1/auth/login",
    alias: "login",
    description: `Authenticates user credentials and returns access and refresh tokens`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        description: `Login credentials`,
        type: "Body",
        schema: LoginRequest,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 401,
        description: `Invalid credentials`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/api/v1/auth/logout",
    alias: "logout",
    description: `Revokes the provided refresh token`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ refresh_token: z.string() }).passthrough(),
      },
    ],
    response: z.void(),
  },
  {
    method: "post",
    path: "/api/v1/auth/logout-all",
    alias: "logoutAll",
    description: `Revokes all refresh tokens for the current user`,
    requestFormat: "json",
    response: z.void(),
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/api/v1/auth/refresh",
    alias: "refresh",
    description: `Uses a valid refresh token to obtain new access and refresh tokens`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        description: `Refresh token`,
        type: "Body",
        schema: z.object({ refresh_token: z.string() }).passthrough(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Invalid refresh token`,
        schema: z.void(),
      },
      {
        status: 422,
        description: `Refresh token expired or revoked`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/api/v1/auth/register",
    alias: "register",
    description: `Creates a new user account and returns authentication tokens`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        description: `Registration details`,
        type: "Body",
        schema: RegisterRequest,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Invalid input`,
        schema: z.void(),
      },
      {
        status: 409,
        description: `Username already exists`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/api/v1/bicycles",
    alias: "findAll_5",
    requestFormat: "json",
    parameters: [
      {
        name: "model",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "pageable",
        type: "Query",
        schema: pageable,
      },
    ],
    response: z.void(),
  },
  {
    method: "post",
    path: "/api/v1/bicycles",
    alias: "create_5",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CreateBicycleRequest,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Invalid input`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Station not found`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/api/v1/bicycles/:id",
    alias: "findById_4",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Bicycle not found`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "delete",
    path: "/api/v1/bicycles/:id",
    alias: "delete_2",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Bicycle not found`,
        schema: z.void(),
      },
      {
        status: 409,
        description: `Cannot delete rented bicycle`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/api/v1/bicycles/needs-service",
    alias: "findNeedingService",
    requestFormat: "json",
    parameters: [
      {
        name: "pageable",
        type: "Query",
        schema: pageable,
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/v1/payments",
    alias: "findAll_4",
    requestFormat: "json",
    parameters: [
      {
        name: "username",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "pageable",
        type: "Query",
        schema: pageable,
      },
    ],
    response: z.void(),
  },
  {
    method: "post",
    path: "/api/v1/payments",
    alias: "create_4",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z
          .object({ amount: z.number().int().gte(1).lte(999999) })
          .passthrough(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Invalid input`,
        schema: z.void(),
      },
      {
        status: 401,
        description: `Unauthorized`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/api/v1/payments/user/:userId",
    alias: "findByUserId_1",
    requestFormat: "json",
    parameters: [
      {
        name: "userId",
        type: "Path",
        schema: z.number().int(),
      },
      {
        name: "pageable",
        type: "Query",
        schema: pageable,
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/v1/rentals",
    alias: "findAll_3",
    requestFormat: "json",
    parameters: [
      {
        name: "pageable",
        type: "Query",
        schema: pageable,
      },
    ],
    response: z.void(),
  },
  {
    method: "post",
    path: "/api/v1/rentals",
    alias: "create_3",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CreateRentalRequest,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Invalid input`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `User, bicycle or station not found`,
        schema: z.void(),
      },
      {
        status: 409,
        description: `Bicycle already rented or user cannot rent`,
        schema: z.void(),
      },
      {
        status: 422,
        description: `Business rule violation`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/api/v1/rentals/:id",
    alias: "findById_3",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Rental not found`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/api/v1/rentals/:id/cancel",
    alias: "cancel",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Rental not found`,
        schema: z.void(),
      },
      {
        status: 422,
        description: `Rental is not active`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "put",
    path: "/api/v1/rentals/:id/complete",
    alias: "complete_1",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ end_station: z.number().int() }).passthrough(),
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Rental or station not found`,
        schema: z.void(),
      },
      {
        status: 409,
        description: `Rental already completed or concurrent modification`,
        schema: z.void(),
      },
      {
        status: 422,
        description: `Rental is not active`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/api/v1/rentals/user/:userId",
    alias: "findByUserId",
    requestFormat: "json",
    parameters: [
      {
        name: "userId",
        type: "Path",
        schema: z.number().int(),
      },
      {
        name: "pageable",
        type: "Query",
        schema: pageable,
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/v1/repairs",
    alias: "findAll_2",
    requestFormat: "json",
    parameters: [
      {
        name: "pageable",
        type: "Query",
        schema: pageable,
      },
    ],
    response: z.void(),
  },
  {
    method: "post",
    path: "/api/v1/repairs",
    alias: "create_2",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CreateRepairRequest,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Invalid input`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Bicycle or technician not found`,
        schema: z.void(),
      },
      {
        status: 409,
        description: `Bicycle already under repair`,
        schema: z.void(),
      },
      {
        status: 422,
        description: `Bicycle is not available`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/api/v1/repairs/:id",
    alias: "findById_2",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Repair not found`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "put",
    path: "/api/v1/repairs/:id/complete",
    alias: "complete",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Repair not found`,
        schema: z.void(),
      },
      {
        status: 422,
        description: `Repair is not in progress`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/api/v1/repairs/scheduled",
    alias: "findScheduled",
    requestFormat: "json",
    parameters: [
      {
        name: "pageable",
        type: "Query",
        schema: pageable,
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/v1/stations",
    alias: "findAll_1",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "pageable",
        type: "Query",
        schema: pageable,
      },
    ],
    response: z.void(),
  },
  {
    method: "post",
    path: "/api/v1/stations",
    alias: "create_1",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CreateStationRequest,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Invalid input`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/api/v1/stations/:id",
    alias: "findById_1",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Station not found`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "delete",
    path: "/api/v1/stations/:id",
    alias: "delete_1",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Station not found`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/api/v1/stations/:id/bicycles",
    alias: "findBicycles",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
      {
        name: "pageable",
        type: "Query",
        schema: pageable,
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/v1/technicians",
    alias: "findAll",
    requestFormat: "json",
    parameters: [
      {
        name: "pageable",
        type: "Query",
        schema: pageable,
      },
    ],
    response: z.void(),
  },
  {
    method: "post",
    path: "/api/v1/technicians",
    alias: "create",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CreateTechnicianRequest,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Invalid input`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/api/v1/technicians/:id",
    alias: "findById",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Technician not found`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "delete",
    path: "/api/v1/technicians/:id",
    alias: "delete",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Technician not found`,
        schema: z.void(),
      },
    ],
  },
]);

export const api = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
