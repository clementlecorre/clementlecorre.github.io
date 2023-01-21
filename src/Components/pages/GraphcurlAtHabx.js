import React, { useState, useEffect } from 'react';

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from "rehype-raw";
import Nav from '../Nav';
import graphcurlmd from '../../mdPages/graphcurl.md';

function Graphcurl(props) {

    const [markdown, setMarkdown] = useState('');

    useEffect(() => {
      fetch(graphcurlmd).then((res) => res.text()).then((text) => {
        setMarkdown(text);
      })
    }, []);

    return (
        <div className='reactMarkDown'>
            <Nav {...props}/>,
            <ReactMarkdown className="content" children={markdown} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}/>
        </div>
    )
}

export default Graphcurl;