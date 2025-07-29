# The Best Way to Work with SVG Icons in React (and TypeScript)

*By Carlos Pumar - March 24, 2024*

After working extensively with icons and reading up on the subject, I've come to a conclusion on how to efficiently manage SVG icons in your React and TypeScript application.

This will include:

* Get all the types of icons in the application.
* Only uploading one icon, then you can assign the color and size you want to this icon.
* We'll also cover the case of having a color with linear-gradient.

## Setup

First of all, we'll need to create a folder within our src folder. I'll call it assets. And inside this folder, I'll create another folder called icons.

It's important that our folder is within src, if it's outside, we won't be able to import the icons dynamically.

## IconBase Component

Let's create the first component called IconBase. This component will be responsible for rendering the icon with the desired color and size.

```typescript
interface PropsIconBase extends HTMLAttributes<SVGElement> {  
    icon: ReactNode;  
    color: 'white' | 'black' | 'gradient';  
    size?: 'big' | 'small' | 'medium';  
}  
    
const IconBase = (  
  { icon, color, size = 'medium', ...rest }: PropsIconBase  
) => {  
const sizePx: number = getSizePx(size);  
  
if (color === 'gradient') {  
    return <SvgGradient icon={icon} size={size} {...rest} />;  
}  
  
 return cloneElement(icon as ReactSVGElement, {  
      fill: color,  
      width: sizePx,  
      height: sizePx,  
      ...rest  
   });  
}  
  
return null;  
};
```

We will pass an icon (which will be an SVGElement), the color, and the size to this component. We'll handle the case where the color is a gradient later on. For the rest cases, we'll simply clone the element with the new properties.

**VERY IMPORTANT!** When uploading your icons to the assets/icons folder, don't forget to remove the fill attribute from the SVG if it has one.

## Dynamic Import Implementation

Now, we need to dynamically import the icons. We'll see how to do it for both Vite and Webpack (create-react-app).

### Webpack Implementation

```typescript
interface Props extends Omit<React.ComponentProps<typeof IconBase>, 'icon'> {  
  icon: IconName;  
}  
  
const Icon = ({ icon, ...rest }: Props) => {  
  const SvgIcon = useDynamicSVGImport(icon);  
  if (!SvgIcon) return null;  
  return <IconBase icon={<SvgIcon />} {...rest} />;  
};  
  
function useDynamicSVGImport(icon: string) {  
  const [iconElement, setIconElement] = useState<React.FC<React.SVGProps<SVGSVGElement>> | null>(  
    null  
  );  
  
  const importIcon = async () => {  
    const path = '../../../assets/icons';  
  
    try {  
      setIconElement(  
        (await import(`!!@svgr/webpack?-svgo,+titleProp,+ref!${path}/${icon}.svg`))  
          .default  
      );  
    } catch (error) {  
      setIconElement(null);  
    }  
  };  
  
  useEffect(() => {  
    importIcon();  
  }, [icon]);  
  
  return iconElement;  
}  
  
export default Icon;
```

`IconName` is simply a type containing all the names of possible icons. Later on, we'll see how to obtain this type.

We'll use a hook to get the state of the icon, which we'll pass as a property to our already created `IconBase` component.

### Vite Implementation

In Vite, the process is a bit more complex. First, we'll need to install `vite-plugin-svgr` to dynamically import the icons.

You can follow the documentation: https://www.npmjs.com/package/vite-plugin-svgr

```typescript
interface Props extends Omit<React.ComponentProps<typeof IconBase>, 'icon'> {  
  icon: IconName;  
}  
  
const Icon = ({ icon, ...rest }: Props) => {  
    const SvgIcon = useDynamicSVGImport(icon);  
    if (!SvgIcon) return null;  
    return <IconBase icon={SvgIcon} {...rest} />  
  };  
  
function useDynamicSVGImport(src: string) {  
    const [icon, setIcon] = useState<JSX.Element | null>(null);  
    
    const importIcon = async () => {  
      const url = `../../assets/icons/${src}.svg?react`; // Important, to be declared outside of the import()  
      try {  
        setIcon((await import(url /* @vite-ignore */)).default);  
      } catch (error) {  
        setIcon(null);  
      }  
    };  
    
    useEffect(() => {  
      importIcon();  
    }, [src]);  
    
    return icon;  
  }  
  
  export default Icon;
```

Once you have installed `vite-plugin-svgr`, the rest of the process is similar to Webpack.

## Gradient Support

Now, we'll see what happens when the icon has a gradient.

```typescript
interface Props extends HTMLAttributes<SVGElement> {  
  icon: ReactNode;  
  size: IconSize;  
}  
  
const SvgGradient = ({ icon, size, ...rest }: Props) => {  
  const sizePx = getIconPx(size);  
  
  return (  
    <svg width={sizePx} height={sizePx} {...rest}>  
      {/* Define the linear gradient */}  
      <linearGradient id='gradient' x1='0%' y1='0%' x2='0%' y2='100%'>  
        <stop offset='0%' style={{ stopColor: color1 }} />  
        <stop offset='100%' style={{ stopColor: color2 }} />  
      </linearGradient>  
  
      {cloneElement(icon as ReactSVGElement, {  
        fill: 'url(#gradient)',  
        width: '100%',  
        height: '100%'  
      })}  
    </svg>  
  );  
};  
  
export default SvgGradient;
```

It's similar to the previous cases, but in this case we wrap the element with a `svg` tag, where we define the linear gradient.

## Type Generation

And finally, let's see how we can get the `IconName` type.   
Let's create a folder (if we haven't already) called `scripts` at the root level (outside of the `src` folder). Then create a new file called `createIconNameTypes.mjs`

```javascript
// scripts/createIconNameTypes.mjs  
  
import fs from 'fs';  
import path from 'path';  
  
const createIconNameTypes = () => {  
  const currentFileUrl = import.meta.url;  
  const currentDir = path.dirname(new URL(currentFileUrl).pathname);  
  
  // Get folder where all icons are situated  
  const assetsFolderPath = path.join(currentDir, '../src/assets', 'icons');  
  
  // Get all filenames from that folder  
  const filenames = fs.readdirSync(assetsFolderPath);  
  
  // Remove the extension from the filenames  
  const fileNamesWithoutExtension = filenames.map((filename) => filename.split('.')[0]);  
  
  // For each filename, create a line of content  
  const filesNameContent = fileNamesWithoutExtension.map((filename) => `\n  | '${filename}'`);  
  
  // Create the type content  
  const typeContent = `export type IconName =${filesNameContent.join('')};\n`;  
  
  // Write the type content to the file in src/types/utils/IconName.ts  
  fs.writeFileSync(path.join(currentDir, '../src/types/utils', 'iconName.d.ts'), typeContent);  
};  
  
createIconNameTypes();
```

This script will automatically create a type with all the icon names of the app.

You can add it in the package.json:

```json
{
  "scripts": {  
    "start": "react-scripts start",  
    "build-icons": "node scripts/createIconNameTypes.mjs",  
    "build": "react-scripts build"  
  }
}
```

Each time you add, remove an icon to the folder assets/icons, execute this script to get the types.

You also can add this script to your CI/CD before the build command.

---

*Source: [Medium - JavaScript in Plain English](https://medium.com/javascript-in-plain-english/the-best-way-to-work-with-svg-icons-in-react-and-typescript-e6fb4d4601c6)* 