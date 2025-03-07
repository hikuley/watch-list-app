import {SetMetadata} from '@nestjs/common';

export const AUTH_META_DATA = 'auth';
export const AuthRequired = () => SetMetadata(AUTH_META_DATA, true);