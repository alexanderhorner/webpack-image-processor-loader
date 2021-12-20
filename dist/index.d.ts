/// <reference types="node" />
import { LoaderContext } from 'webpack';
export default function (this: LoaderContext<any>, source: Buffer): Promise<void>;
