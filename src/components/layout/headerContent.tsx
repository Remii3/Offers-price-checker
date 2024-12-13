"use client";

import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import Link from "next/link";

export default function HeaderContent() {
  const { data, status } = useSession();
  return (
    <>
      {status === "authenticated" ? (
        <>
          {data.user.image ? (
            <div className="flex items-center">
              <Link href={"/"}>
                <Avatar>
                  <AvatarImage src={data.user.image} />
                  <AvatarFallback></AvatarFallback>
                </Avatar>
              </Link>
              <span className="ml-2">{data.user.name}</span>
            </div>
          ) : (
            <Avatar>
              <AvatarFallback></AvatarFallback>
            </Avatar>
          )}
          <Button variant={"outline"} onClick={() => signOut()}>
            Sign out
          </Button>
        </>
      ) : (
        <Avatar>
          <AvatarFallback></AvatarFallback>
        </Avatar>
      )}
    </>
  );
}
