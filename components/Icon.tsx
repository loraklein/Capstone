import { Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {
  MdFolder, MdHistory, MdSettings, MdDelete, MdEdit, MdCheckCircle,
  MdClose, MdRemove, MdFitScreen, MdAdd, MdInfoOutline, MdArrowBack,
  MdPhotoLibrary, MdPerson, MdLogout, MdChevronRight, MdPalette,
  MdDeleteForever, MdPhoto, MdCameraAlt, MdRotateLeft, MdRotateRight,
  MdDragHandle, MdCheck, MdReorder, MdHourglassEmpty, MdAutoAwesome,
  MdPictureAsPdf, MdLightMode, MdDarkMode, MdError, MdRadioButtonUnchecked,
  MdLock, MdInfo
} from 'react-icons/md';

interface IconProps {
  name: keyof typeof MaterialIcons.glyphMap;
  size: number;
  color: string;
}

export default function Icon({ name, size, color }: IconProps) {
  // On web, use react-icons (works perfectly)
  if (Platform.OS === 'web') {
    const iconStyle = { fontSize: size, color };
    
    // Map MaterialIcons names to react-icons components
    const iconMap: Record<string, any> = {
      'folder': MdFolder,
      'history': MdHistory,
      'settings': MdSettings,
      'delete': MdDelete,
      'edit': MdEdit,
      'check-circle': MdCheckCircle,
      'close': MdClose,
      'remove': MdRemove,
      'fit-screen': MdFitScreen,
      'add': MdAdd,
      'info-outline': MdInfoOutline,
      'arrow-back': MdArrowBack,
      'photo-library': MdPhotoLibrary,
      'person': MdPerson,
      'logout': MdLogout,
      'chevron-right': MdChevronRight,
      'palette': MdPalette,
      'delete-forever': MdDeleteForever,
      'photo': MdPhoto,
      'camera-alt': MdCameraAlt,
      'rotate-left': MdRotateLeft,
      'rotate-right': MdRotateRight,
      'drag-handle': MdDragHandle,
      'document-scanner': MdCameraAlt, // Using camera-alt as fallback
      'check': MdCheck,
      'reorder': MdReorder,
      'hourglass-empty': MdHourglassEmpty,
      'auto-awesome': MdAutoAwesome,
      'picture-as-pdf': MdPictureAsPdf,
      'light-mode': MdLightMode,
      'dark-mode': MdDarkMode,
      'error': MdError,
      'radio-button-unchecked': MdRadioButtonUnchecked,
      'lock': MdLock,
      'info': MdInfo,
    };
    
    const IconComponent = iconMap[name];
    if (IconComponent) {
      return <IconComponent style={iconStyle} />;
    }
  }
  
  // On mobile, use MaterialIcons (already works great)
  return <MaterialIcons name={name} size={size} color={color} />;
}

