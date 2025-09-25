import { builder } from '@/schema/builder';

import './mutations';
import './queries';
import './objects';

export const schema = builder.toSchema();
