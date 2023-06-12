'use client';

import Link from "next/link";
import styled from "styled-components";

export default function Header() {
    return (
        <StyledHeader>
            <HeaderInner>
                <LogoLink href="/" alt="go to main">
                    <LogoName>René van Dinter</LogoName>
                    <LogoTitle>Web-Frontend-Developer</LogoTitle>
                    <LogoSubTitle>Graphik- & Webdesigner</LogoSubTitle>
                </LogoLink>
            </HeaderInner>
        </StyledHeader>
    )
}

const StyledHeader = styled.header`
  background: #f8f8f8;
`;

const HeaderInner = styled.div`
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
`;

const LogoLink = styled(Link)`
  display: flex;
  flex-direction: column;
`;

const LogoName = styled.div`
  font-weight: bold;
  text-transform: uppercase;
`;

const LogoTitle = styled.div`
  
`;

const LogoSubTitle = styled.div`
  font-weight: bold;
`;