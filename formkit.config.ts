import { defineFormKitConfig } from '@formkit/vue'
import { createProPlugin, inputs } from '@formkit/pro'
import { createAutoAnimatePlugin } from '@formkit/addons';
import '@formkit/pro/genesis';
import { generateClasses } from '@formkit/themes';
import { rootClasses } from '~/formkit.theme';

export default defineFormKitConfig(() => {

  const config = useRuntimeConfig()
  const pro = createProPlugin(config.public.FORMKIT_PRO_KEY as string, inputs)

  return {
  //theme: 'genesis',
  // tailwind csspriority : 1. tag props / 2. generateClasses / 3. genesis theme/ 4. rootClasses
  config: {
    rootClasses,
    classes: generateClasses({
      global: {
        label: 'text-green-500 formkit-invalid:text-red-900'
      },
      text: {
        //label: 'text-gray-700',
        value: 'text-blue-900'
      },
      password: {},
      url: {},
      "family:box": {},
      "familiy:button": {},
      "family:dropdown": {},
      "family:text": {}
    })
  },
  plugins: [ pro, createAutoAnimatePlugin(),createAutoAnimatePlugin()],
  rules: {
    emailIsUnique(node) {
      const emails = [
        'nastib@gmail.com',
        'wilfrid@gmail.com',
        'dylan@gmail.com',
        'kevin@gmail.com',
        'aurele@gmail.com',
        'elvire@gmail.com',
      ];

      return !emails.includes(node.value as string);
    },
  },
  messages: {
    en: {
      validation: {
        emailIsUnique({ args, name, node }): string {
          return `${node.value} is already taken`;
        },
      },
    },
  },

}})
