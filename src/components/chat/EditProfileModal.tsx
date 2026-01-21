'use client';

import { usePlan } from '@/contexts/PlanContext';
import {
  Modal,
  Avatar,
  Button,
  Group,
  PillsInput,
  Pill,
} from '@mantine/core';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface EditProfileModalProps {
  opened: boolean;
  onClose: () => void;
}

export default function EditProfileModal({
  opened,
  onClose,
}: EditProfileModalProps) {
  const { data: session, update } = useSession();
  const { state } = usePlan();

  const [username, setUsername] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [interestValue, setInterestValue] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* -------------------- Initialize From Session -------------------- */
  useEffect(() => {
    if (opened && session?.user) {
      setUsername(session.user.userName ?? '');
      setInterests(session.user.interests ?? []);
      setAvatar(session.user.image ?? null);
      setError(null);
    }
  }, [opened, session]);

  /* -------------------- Save Handler -------------------- */
  const handleSave = async () => {
    setSaving(true);
    setError(null);

    const payload: Record<string, any> = {};

    if (state?.name_edit && username.trim()) {
      payload.username = username.trim();
    }

    if (interests.length > 0) {
      payload.interests = interests;
    }

    if (avatar) {
      payload.avatar = avatar;
    }

    if (Object.keys(payload).length === 0) {
      setSaving(false);
      onClose();
      return;
    }

    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch { }

      if (!res.ok) {
        setError(data?.error || 'Failed to update profile');
        return;
      }

      await update({
        user: {
          ...session?.user, // 🔥 THIS IS REQUIRED
          ...(payload.username && { userName: payload.username }),
          ...(payload.interests && { interests: payload.interests }),
          ...(payload.avatar && { image: payload.avatar }),
        },
      });
      
      
      

      onClose();
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Profile Settings"
      centered
      overlayProps={{ opacity: 0.55, blur: 3 }}
      styles={{
        content: { backgroundColor: '#0e1326' },
        header: { backgroundColor: '#0e1326' },
        title: { color: 'white' },
      }}
    >
      {/* Avatar */}
      <Group justify="center" mb="md">
        <Avatar
          size={80}
          radius="xl"
          src={avatar || undefined}
          className="cursor-pointer"
        />
      </Group>

      {/* Username */}
      {!state?.name_edit && (
        <p className="mb-1 text-sm text-red-400">
          Username editing is disabled on the free plan
        </p>
      )}

      <input
        value={username}
        disabled={!state?.name_edit}
        onChange={(e) => setUsername(e.currentTarget.value)}
        placeholder={session?.user?.userName || 'Username'}
        className="mb-1 w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2 text-white focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
      />

      {/* Interests */}
      <PillsInput
        label="Interests"
        mt="sm"
        classNames={{
          root: '',
          // We handle 'input' and 'label' styling via globals.css now
        }}
      >
        <Pill.Group>
          {interests.map((item, index) => (
            <Pill
              key={index}
              withRemoveButton
              classNames={{
                root: 'bg-white/10 border border-white/10 text-white rounded-md',
                remove: 'text-gray-400 hover:text-red-400',
              }}
              onRemove={() => setInterests(interests.filter((_, i) => i !== index))}
            >
              {item}
            </Pill>
          ))}

          <PillsInput.Field
            value={interestValue}
            onChange={(e) => setInterestValue(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && interestValue.trim()) {
                e.preventDefault();
                if (!interests.includes(interestValue.trim())) {
                  setInterests([...interests, interestValue.trim()]);
                }
                setInterestValue('');
              }
            }}
            placeholder="Type and press Enter"
            className="bg-transparent text-white focus:outline-none"
          />
        </Pill.Group>
      </PillsInput>


      {/* Error */}
      {error && (
        <p className="mb-3 text-sm text-red-400">{error}</p>
      )}

      {/* Actions */}
      <Group justify="center" mt="lg">
        <Button variant="default" onClick={onClose} disabled={saving}style={{borderRadius:"8px"}}>
          Cancel
        </Button>
        <Button loading={saving} onClick={handleSave} className='rounded-lg' style={{borderRadius:"8px", backgroundColor:"#4f39f6"}}>
          Save
        </Button>
      </Group>
    </Modal>
  );
}
