import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { destroyCookie, parseCookies } from "nookies";
import { AuthTokenError } from "../errors/authTokenError";
import decode from "jwt-decode";
import { validateUserPermissions } from "./validateUserPermissions";
import { redirect } from "next/dist/server/api-utils";

type WithSSRAuthOptions = {
  permissions?: string[];
  roles?: string[];
}

export function withSSRAuth<P>(fn: GetServerSideProps<P>, options?: WithSSRAuthOptions): GetServerSideProps {
  return async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
    const cookies = parseCookies(context);
    const token = cookies['@next-auth.token'];

    if (!token) {
      return {
        redirect: {
          destination: '/',
          permanent: false
        }
      }
    }

    if (!!options) {
      const user = decode<{ permissions: string[]; roles: string[]; }>(token);

      const userHasPermissions = validateUserPermissions({
        user,
        permissions: options.permissions,
        roles: options.roles
      });

      if (!userHasPermissions) {
        return {
          redirect: {
            destination: '/dashboard',
            permanent: false
          }
        }
      }
    }

    try {
      return await fn(context);
    } catch (error) {
      if (error instanceof AuthTokenError) {
        destroyCookie(context, '@next-auth.token');
        destroyCookie(context, '@next-auth.refreshToken');
  
        return {
          redirect: {
            destination: '/',
            permanent: false
          }
        }
      }
    }
  }
}