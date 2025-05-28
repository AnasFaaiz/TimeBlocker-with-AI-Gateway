import React, { useState } from 'react';
import styled from 'styled-components';

interface User {
  name: string;
  email: string;
  avatar?: string;
}

interface NavbarProps {
  user: User;
  activeSection?: string;
  onSectionChange?: (section: string) => void;
  onLogout?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  user, 
  activeSection = 'tasks',
  onSectionChange,
  onLogout 
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleSectionClick = (section: string) => {
    if (onSectionChange) {
      onSectionChange(section);
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    setIsProfileOpen(false);
  };

  return (
    <NavContainer>
      <Brand>
        <Logo>⏰</Logo>
        <AppName>TimeBlocker</AppName>
      </Brand>

      <NavSections>
        <NavItem 
          active={activeSection === 'tasks'} 
          onClick={() => handleSectionClick('tasks')}
        >
          Tasks
        </NavItem>
        <NavItem 
          active={activeSection === 'calendar'} 
          onClick={() => handleSectionClick('calendar')}
        >
          Calendar
        </NavItem>
        <NavItem 
          active={activeSection === 'analytics'} 
          onClick={() => handleSectionClick('analytics')}
        >
          Analytics
        </NavItem>
      </NavSections>

      <ProfileSection>
        <ProfileContainer>
          <ProfileButton onClick={() => setIsProfileOpen(!isProfileOpen)}>
            <UserAvatar>
              {user.avatar ? (
                <AvatarImg src={user.avatar} alt={user.name} />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </UserAvatar>
            <UserInfo>
              <UserName>{user.name}</UserName>
              <UserEmail>{user.email}</UserEmail>
            </UserInfo>
            <Arrow isOpen={isProfileOpen}>▼</Arrow>
          </ProfileButton>

          {isProfileOpen && (
            <DropdownMenu>
              <MenuItem onClick={() => setIsProfileOpen(false)}>
                <MenuIcon>👤</MenuIcon>
                Profile Settings
              </MenuItem>
              <MenuItem onClick={() => setIsProfileOpen(false)}>
                <MenuIcon>⚙️</MenuIcon>
                Preferences
              </MenuItem>
              <MenuDivider />
              <MenuItem onClick={handleLogout} logout>
                <MenuIcon>🚪</MenuIcon>
                Sign Out
              </MenuItem>
            </DropdownMenu>
          )}
        </ProfileContainer>
      </ProfileSection>
    </NavContainer>
  );
};

// Styled Components
const NavContainer = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.35rem 1.2rem;
  background: #1a1a1a;
  border-bottom: 1px solid #333;
  color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
`;

const Logo = styled.span`
  font-size: 1.5rem;
`;

const AppName = styled.span`
  font-size: 1.25rem;
  font-weight: 600;
  color: #4285f4;
  letter-spacing: -0.5px;
`;

const NavSections = styled.div`
  display: flex;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    gap: 0.25rem;
  }
`;

const NavItem = styled.button<{ active: boolean }>`
  padding: 0.6rem 1.2rem;
  background: ${({ active }) => active ? '#4285f4' : 'transparent'};
  border: none;
  border-radius: 8px;
  color: ${({ active }) => active ? '#fff' : '#ccc'};
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ active }) => active ? '#357abd' : '#2a2a2a'};
    color: #fff;
  }

  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
  }
`;

const ProfileSection = styled.div`
  position: relative;
`;

const ProfileContainer = styled.div`
  position: relative;
`;

const ProfileButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background 0.2s ease;

  &:hover {
    background: #2a2a2a;
  }
`;

const UserAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4285f4, #357abd);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1rem;
  overflow: hidden;
  border: 2px solid #333;
`;

const AvatarImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  
  @media (max-width: 576px) {
    display: none;
  }
`;

const UserName = styled.span`
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1.2;
`;

const UserEmail = styled.span`
  font-size: 0.75rem;
  color: #888;
  line-height: 1.2;
`;

const Arrow = styled.span<{ isOpen: boolean }>`
  font-size: 0.7rem;
  color: #888;
  transition: transform 0.2s ease;
  transform: ${({ isOpen }) => isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  
  @media (max-width: 576px) {
    display: none;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 8px;
  min-width: 180px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  overflow: hidden;
`;

const MenuItem = styled.button<{ logout?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  color: ${({ logout }) => logout ? '#ff6b6b' : '#fff'};
  text-align: left;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background 0.2s ease;

  &:hover {
    background: ${({ logout }) => logout ? '#3a1a1a' : '#333'};
  }

  &:first-child {
    padding-top: 1rem;
  }

  &:last-child {
    padding-bottom: 1rem;
  }
`;

const MenuIcon = styled.span`
  font-size: 1rem;
  width: 16px;
  text-align: center;
`;

const MenuDivider = styled.div`
  height: 1px;
  background: #444;
  margin: 0.5rem 0;
`;

export default Navbar;