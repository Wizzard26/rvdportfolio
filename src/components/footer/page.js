'use client';
import Link from "next/link";
import styled from "styled-components";
import StyledComponentsRegistry from "@/lib/registry";

export default function Footer() {
    return(
        <>
            <StyledComponentsRegistry>
                <StyledFooter>
                    <div className="content-inner">
                        Footer
                        <Link href="/dashboard">Go to Admin</Link>
                    </div>
                </StyledFooter>
            </StyledComponentsRegistry>
        </>
    )
}

const StyledFooter = styled.footer`
  width: 100%;
  height: 40px;
  position: relative;
  left: 0;
  bottom: 0;
  background-color: rgba(98, 131, 149, 1);
  color: var(--fontlight);
`;