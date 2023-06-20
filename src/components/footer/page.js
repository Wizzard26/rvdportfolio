'use client';
import Link from "next/link";
import styled from "styled-components";

export default function Footer() {
    return(
        <>
            <StyledFooter>
                <div className="content-inner">
                    Footer
                    <Link href="/dashboard">Go to Admin</Link>
                </div>
            </StyledFooter>
        </>
    )
}

const StyledFooter = styled.footer`
  width: 100%;
  height: 40px;
  position: absolute;
  left: 0;
  bottom: 0;
`;