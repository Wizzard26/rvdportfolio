'use client';
import Link from "next/link";
import styled from "styled-components";
import StyledComponentsRegistry from "@/lib/registry";

export default function Footer() {
    const yearStart = 2013;
    const yearNow = new Date().getFullYear();

    return(
        <>
            <StyledComponentsRegistry>
                <StyledFooter>
                    <div className="content-inner">
                        Footer
                        <Link href="/dashboard">Go to Admin</Link>
                    </div>
                    <StyledEndLine>
                        © Copyright {yearStart} - {yearNow} | Design, Code and Content by Rene van Dinter | all rights reserved
                    </StyledEndLine>
                </StyledFooter>
            </StyledComponentsRegistry>
        </>
    )
}

const StyledFooter = styled.footer`
  width: 100%;
  min-height: 40px;
  position: relative;
  left: 0;
  bottom: 0;
  background-color: var(--primary);
  color: var(--fontlight);
`;

const StyledEndLine = styled.div`
  width: 100%;
  background-color: var(--dark);
  padding: 3px 15px;
  text-align: center;
`