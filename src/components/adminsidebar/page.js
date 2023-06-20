'use client';
import styled from "styled-components";
import AdminNavi from "@/components/adminnavi/page";

export default function AdminSidebar() {
    return(
        <StyledAside>
            <div className="admin-welcome">Hello Admin</div>
            <AdminNavi />
        </StyledAside>
    )
}

const StyledAside = styled.aside`
  max-width: 350px;
  height: 100%;
  background: #253a3a;
  color: #FFFFFF;
  flex: 0 0 35%;
`;